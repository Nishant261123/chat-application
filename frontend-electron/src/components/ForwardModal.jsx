function ForwardModal({
    forwardMessage,
    users,
    user,
    handleForwardConfirm,
    setForwardMessage
}) {
    if (!forwardMessage) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-[#202c33] text-white w-[350px] rounded-2xl p-5">
                <h2 className="text-xl font-bold mb-4">
                    Forward message
                </h2>

                <div className="max-h-[300px] overflow-y-auto">
                    {
                        users
                            .filter((u) => u.name !== user)
                            .map((u) => (
                                <div
                                    key={u.name}
                                    onClick={() => handleForwardConfirm(u.name)}
                                    className="p-3 hover:bg-[#2a3942] cursor-pointer rounded-lg"
                                >
                                    {u.name}
                                </div>
                            ))
                    }
                </div>

                <button
                    onClick={() => setForwardMessage(null)}
                    className="mt-4 bg-red-500 px-4 py-2 rounded-lg"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default ForwardModal;