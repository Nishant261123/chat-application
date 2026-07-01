import MessageBubble from "./MessageBubble";

function MessageList({
    filteredMessages,
    user,
    pinnedIds,
    starredIds,
    selectedIds,
    setPreviewImage,
    handleRightClick,
    typingUser,
    selectedUser,
    groupSeenMap,
    onOpenSeenInfo,
    messagesEndRef
}) {
    const showTyping =
        typingUser !== "" &&
        selectedUser !== "" &&
        typingUser === selectedUser;

    return (
        <div className="flex-1 overflow-y-auto p-5 flex flex-col">
            {filteredMessages.map((msg, index) => (
                <MessageBubble
                    key={msg.id || `message-${index}`}
                    msg={msg}
                    index={index}
                    filteredMessages={filteredMessages}
                    user={user}
                    pinnedIds={pinnedIds}
                    starredIds={starredIds}
                    selectedIds={selectedIds}
                    setPreviewImage={setPreviewImage}
                    handleRightClick={handleRightClick}
                    groupSeenMap={groupSeenMap}
                    onOpenSeenInfo={onOpenSeenInfo}
                />
            ))}

            {showTyping && (
                <div className="bg-white self-start px-4 py-2 rounded-2xl mb-3 shadow text-sm text-gray-500">
                    Typing...
                </div>
            )}

            <div ref={messagesEndRef}></div>
        </div>
    );
}

export default MessageList;