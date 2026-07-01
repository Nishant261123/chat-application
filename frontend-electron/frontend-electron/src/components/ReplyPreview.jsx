function ReplyPreview({ replyMessage, getMessageText, setReplyMessage }) {
    if (!replyMessage) return null;

    return (
        <div className="bg-[#d9fdd3] px-4 py-2 flex justify-between items-center border-b">
            <div>
                <div className="text-sm font-semibold text-green-700">
                    Replying to {replyMessage.sender}
                </div>

                <div className="text-xs text-gray-700">
                    {getMessageText(replyMessage)}
                </div>
            </div>

            <button
                onClick={() => setReplyMessage(null)}
                className="text-red-500 text-xl"
            >
                ✕
            </button>
        </div>
    );
}

export default ReplyPreview;