import { useState } from "react";
import ChatOptionsMenu from "./ChatOptionsMenu";

function ChatHeader({
    selectedUser,
    selectedUserData,
    formatLastSeen,
    isBlocked,
    onReport,
    onBlock,
    onClearChat,
    selectedChatType,
    onOpenGroupInfo
}) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="relative bg-[#202c33] text-white p-4 flex items-center justify-between shadow">
            <div
                onClick={() => {
                    if (selectedChatType === "GROUP") {
                        onOpenGroupInfo();
                    }
                }}
                className={`flex items-center gap-3 ${
                    selectedChatType === "GROUP" ? "cursor-pointer" : ""
                }`}
            >
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-xl font-bold uppercase">
                    {selectedChatType === "GROUP" ? "👥" : selectedUser?.charAt(0)}
                </div>

                <div>
                    <div className="text-lg font-semibold">
                        {selectedUser}
                    </div>

                    <div className="text-sm text-gray-300">
                        {
                            selectedChatType === "GROUP"
                                ? "Click to view group info"
                                : isBlocked
                                    ? "Blocked"
                                    : selectedUserData?.online
                                        ? "🟢 Online"
                                        : `Last seen ${formatLastSeen(selectedUserData?.lastSeen)}`
                        }
                    </div>
                </div>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu((prev) => !prev);
                }}
                className="text-2xl px-3 py-1 rounded-full hover:bg-[#2a3942]"
            >
                ⋮
            </button>

            {
                showMenu && (
                    <ChatOptionsMenu
                        isBlocked={isBlocked}
                        onReport={() => {
                            setShowMenu(false);
                            onReport();
                        }}
                        onBlock={() => {
                            setShowMenu(false);
                            onBlock();
                        }}
                        onClearChat={() => {
                            setShowMenu(false);
                            onClearChat();
                        }}
                    />
                )
            }
        </div>
    );
}

export default ChatHeader;