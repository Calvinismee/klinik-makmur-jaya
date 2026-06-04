<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index(Request $request)
    {
        $query = Medicine::with('category')->withSum('batches', 'remaining_quantity')->where('is_active', true);
        $search = trim((string) $request->input('search', ''));

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $medicines = $search === ''
            ? $query->paginate(12)->withQueryString()
            : $this->fuzzyPaginate($request, $query->get(), $search);

        $categories = Category::all();

        return Inertia::render('Customer/Catalog/Index', [
            'medicines' => $medicines,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category_id']),
        ]);
    }

    public function autocomplete(Request $request)
    {
        $search = trim((string) $request->input('search', ''));

        if ($search === '') {
            return response()->json([]);
        }

        $query = Medicine::with('category')
            ->withSum('batches', 'remaining_quantity')
            ->where('is_active', true);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $suggestions = $this->rankMedicines($query->get(), $search)
            ->take(8)
            ->map(fn (Medicine $medicine) => [
                'id' => $medicine->id,
                'name' => $medicine->name,
                'code' => $medicine->code,
                'category' => $medicine->category?->name,
                'price' => $medicine->price,
                'stock' => $medicine->batches_sum_remaining_quantity ?? 0,
            ])
            ->values();

        return response()->json($suggestions);
    }

    public function show(Medicine $medicine)
    {
        if (!$medicine->is_active) {
            abort(404);
        }

        $medicine->load(['category', 'supplier']);
        $medicine->loadSum('batches', 'remaining_quantity');

        return Inertia::render('Customer/Catalog/Show', [
            'medicine' => $medicine,
        ]);
    }

    private function fuzzyPaginate(Request $request, $medicines, string $search): LengthAwarePaginator
    {
        $ranked = $this->rankMedicines($medicines, $search);
        $perPage = 12;
        $page = max(1, (int) $request->input('page', 1));

        return new LengthAwarePaginator(
            $ranked->slice(($page - 1) * $perPage, $perPage)->values(),
            $ranked->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );
    }

    private function rankMedicines($medicines, string $search)
    {
        return $medicines
            ->map(function (Medicine $medicine) use ($search) {
                $score = $this->fuzzyScore($medicine, $search);

                if ($score === null) {
                    return null;
                }

                $medicine->setAttribute('search_score', $score);

                return $medicine;
            })
            ->filter()
            ->sortBy([
                ['search_score', 'asc'],
                ['name', 'asc'],
            ])
            ->values();
    }

    private function fuzzyScore(Medicine $medicine, string $search): ?int
    {
        $needle = $this->normalizeSearchText($search);

        if ($needle === '') {
            return 0;
        }

        $haystacks = array_filter([
            $this->normalizeSearchText($medicine->name),
            $this->normalizeSearchText($medicine->code),
            $this->normalizeSearchText($medicine->category?->name ?? ''),
            $this->normalizeSearchText($medicine->composition ?? ''),
            $this->normalizeSearchText($medicine->description ?? ''),
        ]);

        $bestScore = null;

        foreach ($haystacks as $haystack) {
            if ($haystack === $needle) {
                return 0;
            }

            if (str_starts_with($haystack, $needle)) {
                $bestScore = min($bestScore ?? 1, 1);
                continue;
            }

            if (str_contains($haystack, $needle)) {
                $bestScore = min($bestScore ?? 2, 2);
                continue;
            }

            $tokenScore = $this->tokenScore($needle, $haystack);

            if ($tokenScore !== null) {
                $bestScore = min($bestScore ?? $tokenScore, $tokenScore);
            }
        }

        return $bestScore;
    }

    private function tokenScore(string $needle, string $haystack): ?int
    {
        $needleTokens = preg_split('/\s+/', $needle, -1, PREG_SPLIT_NO_EMPTY);
        $haystackTokens = preg_split('/\s+/', $haystack, -1, PREG_SPLIT_NO_EMPTY);

        if (!$needleTokens || !$haystackTokens) {
            return null;
        }

        $score = 0;
        $threshold = 0;

        foreach ($needleTokens as $needleToken) {
            $bestTokenScore = null;

            foreach ($haystackTokens as $haystackToken) {
                if (str_contains($haystackToken, $needleToken)) {
                    $bestTokenScore = 0;
                    break;
                }

                $distance = levenshtein($needleToken, $haystackToken);
                $bestTokenScore = min($bestTokenScore ?? $distance, $distance);
            }

            $score += $bestTokenScore ?? strlen($needleToken);
            $threshold += max(1, (int) floor(strlen($needleToken) * 0.4));
        }

        return $score <= $threshold ? $score + 3 : null;
    }

    private function normalizeSearchText(string $value): string
    {
        $value = strtolower($value);
        $value = preg_replace('/[^a-z0-9]+/', ' ', $value) ?? '';

        return trim(preg_replace('/\s+/', ' ', $value) ?? '');
    }
}
