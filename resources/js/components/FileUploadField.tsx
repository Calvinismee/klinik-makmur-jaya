import { useEffect, useId, useState } from 'react';

type FileUploadFieldProps = {
    label: string;
    accept?: string;
    helper?: string;
    buttonText?: string;
    selectedFile?: File | null;
    currentImageUrl?: string | null;
    currentImageAlt?: string;
    error?: string;
    required?: boolean;
    compact?: boolean;
    previewImage?: boolean;
    onFileChange: (file: File | null) => void;
};

export default function FileUploadField({
    label,
    accept,
    helper,
    buttonText = 'Pilih File',
    selectedFile,
    currentImageUrl,
    currentImageAlt = 'Preview gambar',
    error,
    required = false,
    compact = false,
    previewImage = false,
    onFileChange,
}: FileUploadFieldProps) {
    const inputId = useId();
    const [localFile, setLocalFile] = useState<File | null>(
        selectedFile || null,
    );
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const activeFile = selectedFile !== undefined ? selectedFile : localFile;

    useEffect(() => {
        setLocalFile(selectedFile || null);
    }, [selectedFile]);

    useEffect(() => {
        if (
            !previewImage ||
            !activeFile ||
            !activeFile.type.startsWith('image/')
        ) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(activeFile);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [activeFile, previewImage]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setLocalFile(file);
        onFileChange(file);
    };

    return (
        <div className={compact ? 'min-w-[220px]' : ''}>
            <label className="mb-1 block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <label
                htmlFor={inputId}
                className={`group flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed border-cyan-200 bg-cyan-50/50 transition hover:border-cyan-400 hover:bg-cyan-50 ${
                    compact ? 'px-4 py-3' : 'p-4'
                }`}
            >
                {previewImage && (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-cyan-100 bg-white">
                        {previewUrl || currentImageUrl ? (
                            <img
                                src={previewUrl || currentImageUrl || undefined}
                                alt={currentImageAlt}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <svg
                                viewBox="0 0 24 24"
                                className="h-7 w-7 text-cyan-600"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path d="M4 16.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2.5" />
                                <path d="M12 4v12" />
                                <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
                            </svg>
                        )}
                    </div>
                )}

                {!previewImage && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-cyan-600 shadow-sm ring-1 ring-cyan-100">
                        <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        >
                            <path d="M4 16.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2.5" />
                            <path d="M12 4v12" />
                            <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
                        </svg>
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900">
                        {activeFile ? activeFile.name : buttonText}
                    </div>
                    {helper && (
                        <div className="mt-1 text-xs text-gray-500">
                            {helper}
                        </div>
                    )}
                </div>
            </label>
            <input
                id={inputId}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleChange}
            />
            {error && <div className="mt-1 text-sm text-red-500">{error}</div>}
        </div>
    );
}
