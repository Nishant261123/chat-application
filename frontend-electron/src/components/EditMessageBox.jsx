function EditMessageBox({
    editMessage,
    editText,
    setEditText,
    handleSaveEdit,
    handleCancelEdit
}) {
    if (!editMessage) return null;

    return (
        <div className="bg-[#f0f2f5] px-4 py-3 border-b flex items-center gap-3">
            <div className="flex-1">
                <div className="text-sm font-semibold text-green-700 mb-1">
                    Editing message
                </div>

                <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSaveEdit();
                        }
                    }}
                    className="w-full p-3 rounded-lg border outline-none"
                    autoFocus
                />
            </div>

            <button
                onClick={handleSaveEdit}
                className="bg-green-500 text-white px-4 py-2 rounded-lg"
            >
                Save
            </button>

            <button
                onClick={handleCancelEdit}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
                Cancel
            </button>
        </div>
    );
}

export default EditMessageBox;