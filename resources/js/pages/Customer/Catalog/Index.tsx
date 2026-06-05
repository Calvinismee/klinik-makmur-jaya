import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';

type MedicineSuggestion = {
    id: number;
    name: string;
    code: string;
    category?: string | null;
    price: number;
    stock: number;
};

export default function CatalogIndex({
    medicines,
    categories,
    filters,
}: {
    medicines: any;
    categories: any[];
    filters: any;
}) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [catalogMedicines, setCatalogMedicines] = useState(medicines);
    const [suggestions, setSuggestions] = useState<MedicineSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);

    const loadCatalog = async (nextSearch: string, nextCategoryId: string) => {
        setIsLoadingCatalog(true);

        try {
            const params = new URLSearchParams();

            if (nextSearch) {
                params.set('search', nextSearch);
            }

            if (nextCategoryId) {
                params.set('category_id', nextCategoryId);
            }

            const response = await fetch(
                `/customer/catalog?${params.toString()}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                },
            );

            if (!response.ok) {
                throw new Error('Gagal memuat katalog');
            }

            const page = await response.json();
            setCatalogMedicines(page.medicines);
        } finally {
            setIsLoadingCatalog(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuggestions(false);
        loadCatalog(search, categoryId);
    };

    const selectSuggestion = (suggestion: MedicineSuggestion) => {
        setSearch(suggestion.name);
        setShowSuggestions(false);
        loadCatalog(suggestion.name, categoryId);
    };

    useEffect(() => {
        const keyword = search.trim();

        if (keyword.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            setIsSearching(true);

            const params = new URLSearchParams({
                search: keyword,
                category_id: categoryId,
            });

            fetch(`/customer/catalog/autocomplete?${params.toString()}`, {
                signal: controller.signal,
            })
                .then((response) => response.json())
                .then((data: MedicineSuggestion[]) => {
                    setSuggestions(data);
                    setShowSuggestions(data.length > 0);
                })
                .catch((error) => {
                    if (error.name !== 'AbortError') {
                        setSuggestions([]);
                    }
                })
                .finally(() => setIsSearching(false));
        }, 250);

        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [search, categoryId]);

    return (
        <AppLayout title="Katalog Obat">
            <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                    <div className="relative min-w-[220px] flex-1">
                        <input
                            type="text"
                            placeholder="Cari obat..."
                            className="w-full rounded-md border p-2"
                            value={search}
                            onFocus={() =>
                                suggestions.length > 0 &&
                                setShowSuggestions(true)
                            }
                            onBlur={() =>
                                window.setTimeout(
                                    () => setShowSuggestions(false),
                                    150,
                                )
                            }
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setShowSuggestions(true);
                            }}
                        />
                        {showSuggestions && (
                            <div className="absolute top-full right-0 left-0 z-20 mt-1 max-h-80 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion.id}
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() =>
                                            selectSuggestion(suggestion)
                                        }
                                        className="block w-full border-b border-gray-100 px-3 py-2 text-left transition last:border-b-0 hover:bg-cyan-50"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-semibold text-gray-900">
                                                    {suggestion.name}
                                                </div>
                                                <div className="truncate text-xs text-gray-500">
                                                    {suggestion.code}{' '}
                                                    {suggestion.category
                                                        ? `- ${suggestion.category}`
                                                        : ''}
                                                </div>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <div className="text-xs font-bold text-cyan-600">
                                                    Rp{' '}
                                                    {Number(
                                                        suggestion.price,
                                                    ).toLocaleString('id-ID')}
                                                </div>
                                                <div className="text-[11px] text-gray-500">
                                                    Stok {suggestion.stock}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {isSearching && (
                            <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-gray-400">
                                mencari
                            </div>
                        )}
                    </div>
                    <select
                        className="rounded-md border p-2"
                        value={categoryId}
                        onChange={(e) => {
                            const nextCategoryId = e.target.value;
                            setCategoryId(nextCategoryId);
                            loadCatalog(search, nextCategoryId);
                        }}
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoadingCatalog}
                    >
                        {isLoadingCatalog ? 'Memuat...' : 'Search'}
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {catalogMedicines.data.map((med: any) => (
                    <div
                        key={med.id}
                        className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm"
                    >
                        <div className="flex h-48 items-center justify-center bg-gray-100">
                            {med.image ? (
                                <img
                                    src={`/storage/${med.image}`}
                                    alt={med.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-400">
                                    Tidak Ada Gambar
                                </span>
                            )}
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                            <h3 className="mb-1 text-lg font-bold">
                                {med.name}
                            </h3>
                            <p className="mb-2 text-sm text-gray-500">
                                {med.category?.name}
                            </p>
                            <div className="mb-4 font-bold text-cyan-600">
                                Rp {Number(med.price).toLocaleString('id-ID')}
                            </div>

                            <div className="mb-2 text-sm font-semibold text-gray-700">
                                Stok: {med.batches_sum_remaining_quantity || 0}
                            </div>

                            {Boolean(med.requires_prescription) && (
                                <div className="mb-4 inline-flex items-center self-start rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                    Butuh Resep
                                </div>
                            )}

                            <div className="mt-auto">
                                <Link
                                    href={`/customer/catalog/${med.id}`}
                                    className="btn-secondary w-full"
                                >
                                    Lihat Detail
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {catalogMedicines.data.length === 0 && (
                <div className="rounded-lg bg-white py-12 text-center text-gray-500">
                    Tidak ada obat yang ditemukan.
                </div>
            )}
        </AppLayout>
    );
}
