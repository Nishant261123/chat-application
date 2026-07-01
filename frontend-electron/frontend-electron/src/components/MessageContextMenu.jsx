function MessageContextMenu({
    openMenuId,
    menuPosition,
    filteredMessages,
    pinnedIds,
    starredIds,
    selectedIds,
    handleReply,
    handleStartEdit,
    handleCopy,
    setForwardMessage,
    closeMenu,
    handleReaction,
    handlePin,
    handleStar,
    handleSelect,
    handleDeleteForMe,
    handleDeleteForEveryone,
    user
}) {
    if (openMenuId === null) return null;

    const msg = filteredMessages.find(
        (m, i) => (m.id || i) === openMenuId
    );

    if (!msg) return null;

    const isPinned = pinnedIds.includes(msg.id);
    const isStarred = starredIds.includes(msg.id);
    const isSelected = selectedIds.includes(msg.id);

    const canReact =
        msg.messageType !== "SYSTEM" &&
        msg.messageType !== "DELETED";

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className="fixed z-50 bg-[#202c33] text-white rounded-xl shadow-2xl w-[220px] py-2 text-sm max-h-[450px] overflow-y-auto"
            style={{
                top: menuPosition.y,
                left: menuPosition.x
            }}
        >
            {
                msg.messageType !== "SYSTEM" && (
                    <button
                        onClick={() => handleReply(msg)}
                        className="w-full text-left px-4 py-2 hover:bg-[#2a3942]"
                    >
                        ↩ Reply
                    </button>
                )
            }

            {
                msg.sender === user &&
                msg.messageType === "TEXT" && (
                    <button
                        onClick={() => handleStartEdit(msg)}
                        className="w-full text-left px-4 py-2 hover:bg-[#2a3942]"
                    >
                        ✏️ Edit
                    </button>
                )
            }

            {
                msg.messageType !== "SYSTEM" && (
                    <button
                        onClick={() => handleCopy(msg)}
                        className="w-full text-left px-4 py-2 hover:bg-[#2a3942]"
                    >
                        📋 Copy
                    </button>
                )
            }

            {
                msg.messageType !== "SYSTEM" && (
                    <button
                        onClick={() => {
                            setForwardMessage(msg);
                            closeMenu();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[#2a3942]"
                    >
                        ➜ Forward
                    </button>
                )
            }

            {
                canReact && (
                    <div className="px-3 py-2 flex gap-2 border-t border-gray-600">
                        {
                            ["❤️", "😂", "🔥", "👍", "😮"].map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleReaction(msg, emoji)}
                                    className="text-xl hover:scale-125 transition-all"
                                >
                                    {emoji}
                                </button>
                            ))
                        }
                    </div>
                )
            }

            {
                msg.messageType !== "SYSTEM" && (
                    <>
                        <button
                            onClick={() => handlePin(msg)}
                            className="w-full text-left px-4 py-2 hover:bg-[#2a3942]"
                        >
                            📌 {isPinned ? "Unpin" : "Pin"}
                        </button>

                        <button
                            onClick={() => handleStar(msg)}
                            className="w-full text-left px-4 py-2 hover:bg-[#2a3942]"
                        >
                            ⭐ {isStarred ? "Unstar" : "Star"}
                        </button>

                        <button
                            onClick={() => handleSelect(msg)}
                            className="w-full text-left px-4 py-2 hover:bg-[#2a3942]"
                        >
                            ☑ {isSelected ? "Unselect" : "Select"}
                        </button>
                    </>
                )
            }

            <div className="border-t border-gray-600 my-1"></div>

            {
                msg.messageType !== "SYSTEM" && (
                    <button
                        onClick={() => handleDeleteForMe(msg)}
                        className="w-full text-left px-4 py-2 hover:bg-red-600 text-red-300"
                    >
                        🗑 Delete for me
                    </button>
                )
            }

            {
                msg.sender === user &&
                msg.messageType !== "DELETED" &&
                msg.messageType !== "SYSTEM" && (
                    <button
                        onClick={() => handleDeleteForEveryone(msg)}
                        className="w-full text-left px-4 py-2 hover:bg-red-600 text-red-300"
                    >
                        🗑 Delete for everyone
                    </button>
                )
            }
        </div>
    );
}

export default MessageContextMenu;