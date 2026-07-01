function ChatOptionsMenu({
    isBlocked,
    onReport,
    onBlock,
    onClearChat
}) {
    return (
        <div className="absolute right-4 top-16 bg-[#111b21] text-white w-[220px] rounded-md shadow-2xl py-2 z-50">
            <button onClick={onReport} className="w-full flex items-center gap-4 px-5 py-3 hover:bg-[#202c33] text-left">
                
                <span>Report</span>
            </button>

            <button onClick={onBlock} className="w-full flex items-center gap-4 px-5 py-3 hover:bg-[#202c33] text-left">
                
                <span>{isBlocked ? "Unblock" : "Block"}</span>
            </button>

            <button onClick={onClearChat} className="w-full flex items-center gap-4 px-5 py-3 hover:bg-[#202c33] text-left">
                
                <span>Clear chat</span>
            </button>
        </div>
    );
}

export default ChatOptionsMenu;