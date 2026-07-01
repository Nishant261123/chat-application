function ImagePreviewModal({
    previewImage,
    setPreviewImage
}) {
    if (!previewImage) return null;

    return (
        <div
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-5"
        >
            <img
                src={previewImage}
                alt="preview"
                className="max-w-full max-h-full rounded-xl shadow-2xl"
            />

            <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-5 right-6 text-white text-4xl"
            >
                ×
            </button>
        </div>
    );
}

export default ImagePreviewModal;