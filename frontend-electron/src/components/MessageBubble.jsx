import { Fragment } from "react";

function MessageBubble({
    msg,
    index,
    filteredMessages,
    user,
    pinnedIds,
    starredIds,
    selectedIds,
    setPreviewImage,
    handleRightClick,
    groupSeenMap,
    onOpenSeenInfo
}) {
    const currentDate = new Date(msg.timestamp).toDateString();

    const previousDate =
        index > 0
            ? new Date(filteredMessages[index - 1].timestamp).toDateString()
            : null;

    const showDateSeparator = currentDate !== previousDate;

    const today = new Date().toDateString();

    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    const yesterday = yesterdayDate.toDateString();

    let dateLabel = currentDate;

    if (currentDate === today) {
        dateLabel = "Today";
    } else if (currentDate === yesterday) {
        dateLabel = "Yesterday";
    }

    const isMine = msg.sender === user;
    const isPinned = pinnedIds.includes(msg.id);
    const isStarred = starredIds.includes(msg.id);
    const isSelected = selectedIds.includes(msg.id);

    const seenCount = groupSeenMap?.[msg.id]?.length || 0;

    return (
        <Fragment>
            {showDateSeparator && (
                <div className="flex justify-center my-4">
                    <div className="bg-[#d9fdd3] text-gray-700 text-xs px-4 py-1 rounded-full shadow">
                        {dateLabel}
                    </div>
                </div>
            )}

            {msg.messageType === "SYSTEM" ? (
                <div className="flex justify-center my-3">
                    <div className="bg-[#d9fdd3] text-gray-700 text-xs px-4 py-2 rounded-full shadow">
                        {msg.content}
                    </div>
                </div>
            ) : (
                <div
                    onContextMenu={(e) => handleRightClick(e, msg, index)}
                    className={`relative max-w-[320px] px-4 py-3 rounded-2xl mb-5 shadow cursor-default
                    ${isMine ? "bg-[#DCF8C6] self-end" : "bg-white self-start"}
                    ${isSelected ? "ring-2 ring-green-500" : ""}
                    `}
                >
                    <div className="text-xs font-bold mb-1 text-gray-600">
                        {msg.sender}
                        {isPinned && " 📌"}
                        {isStarred && " ⭐"}
                    </div>

                    <div className="text-[15px] break-words whitespace-pre-line">
                        {msg.messageType === "IMAGE" && msg.fileUrl ? (
                            <img
                                src={msg.fileUrl}
                                alt={msg.fileName || "image"}
                                onClick={() => setPreviewImage(msg.fileUrl)}
                                className="max-w-[250px] rounded-xl cursor-pointer hover:opacity-90"
                            />
                        ) : msg.messageType === "FILE" && msg.fileUrl ? (
                            <a
                                href={msg.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 underline font-semibold"
                            >
                                📄 {msg.fileName || "Download file"}
                            </a>
                        ) : msg.messageType === "VOICE" && msg.fileUrl ? (
                            <div className="flex flex-col gap-2">
                                <div className="text-sm font-semibold text-gray-700">
                                    🎤 Voice Note
                                </div>

                                <audio controls className="w-[250px]">
                                    <source src={msg.fileUrl} type="audio/webm" />
                                    Your browser does not support audio.
                                </audio>
                            </div>
                        ) : msg.messageType === "DELETED" ? (
                            <div className="italic text-gray-500 text-sm">
                                🚫{" "}
                                {msg.sender === user
                                    ? "You deleted this message"
                                    : "This message was deleted"}
                            </div>
                        ) : (
                            <>
                                {msg.content}

                                {msg.edited && (
                                    <span className="text-[11px] text-gray-500 ml-2">
                                        edited
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    {msg.reaction && msg.messageType !== "SYSTEM" && (
                        <div
                            className={`
                                absolute
                                -bottom-3
                                ${isMine ? "right-2" : "left-2"}
                                bg-white
                                border
                                shadow-md
                                rounded-full
                                px-2
                                py-[2px]
                                text-sm
                                flex
                                items-center
                                justify-center
                                min-w-[28px]
                                z-10
                            `}
                        >
                            {msg.reaction}
                        </div>
                    )}

                    <div className="text-[10px] text-gray-500 text-right mt-2 flex justify-end gap-1">
                        <span>
                            {msg.timestamp
                                ? new Date(msg.timestamp).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit"
                                  })
                                : ""}
                        </span>

                        {isMine &&
                            msg.messageType !== "DELETED" &&
                            msg.messageType !== "SYSTEM" && (
                                <span
                                    className={
                                        msg.seen
                                            ? "text-blue-500 text-[13px]"
                                            : "text-gray-500 text-[13px]"
                                    }
                                >
                                    {msg.seen ? "✓✓" : msg.delivered ? "✓✓" : "✓"}
                                </span>
                            )}
                    </div>

                    {isMine &&
                        seenCount > 0 &&
                        msg.messageType !== "SYSTEM" &&
                        msg.messageType !== "DELETED" && (
                            <button
                                onClick={() =>
                                    onOpenSeenInfo(groupSeenMap?.[msg.id] || [])
                                }
                                className="text-[10px] text-blue-500 text-right mt-1 block ml-auto hover:underline"
                            >
                                Seen by {seenCount}
                            </button>
                        )}
                </div>
            )}
        </Fragment>
    );
}

export default MessageBubble;