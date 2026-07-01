import axios from "axios";

function Sidebar({
    user,
    users,
    groups,
    selectedUser,
    setSelectedUser,
    selectedGroup,
    setSelectedGroup,
    selectedChatType,
    setSelectedChatType,
    setShowCreateGroup,
    handleDeleteGroup,
    formatLastSeen,
    disconnectWebSocket,
    unreadCounts
}) {
    const handleLogout = async () => {
        try {
            await axios.put(
                `http://localhost:8080/api/auth/logout/${user}`
            );

            localStorage.removeItem("chatUser");
            localStorage.removeItem(`${user}_selectedChat`);

            disconnectWebSocket();
            window.location.reload();

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="w-[320px] bg-[#111b21] text-white flex flex-col border-r border-gray-800">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center">
                <div>
                    <div className="text-xl font-bold">{user}</div>
                    <div className="text-sm text-green-400">🟢 Online</div>
                </div>

                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-sm"
                >
                    Logout
                </button>
            </div>

            <div className="p-3 border-b border-gray-800">
                <button
                    onClick={() => setShowCreateGroup(true)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold"
                >
                    + Create Group
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-2 text-gray-400 text-sm">Chats</div>

                {users
                    .filter((u) => u.name !== user)
                    .map((u) => {
                        const unreadCount = unreadCounts?.[u.name] || 0;

                        return (
                            <div
                                key={u.name}
                                onClick={() => {
                                    setSelectedChatType("PRIVATE");
                                    setSelectedUser(u.name);
                                    setSelectedGroup(null);

                                    localStorage.setItem(
                                        `${user}_selectedChat`,
                                        u.name
                                    );
                                }}
                                className={`p-4 cursor-pointer border-b border-gray-800 hover:bg-[#202c33]
                                ${selectedChatType === "PRIVATE" && selectedUser === u.name ? "bg-[#202c33]" : ""}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-xl font-bold uppercase">
                                        {u.name.charAt(0)}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold text-lg">
                                                {u.name}
                                            </div>

                                            {unreadCount > 0 && (
                                                <div className="bg-green-500 text-white text-xs font-bold min-w-[22px] h-[22px] px-2 rounded-full flex items-center justify-center">
                                                    {unreadCount}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-sm mt-1">
                                            {u.online ? (
                                                <span className="text-green-400">🟢 Online</span>
                                            ) : (
                                                <span className="text-gray-400">
                                                    Last seen {formatLastSeen(u.lastSeen)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                <div className="px-4 py-2 text-gray-400 text-sm border-t border-gray-800">
                    Groups
                </div>

                {groups?.length > 0 ? (
                    groups.map((group) => (
                        <div
                            key={group.id}
                            onClick={() => {
                                setSelectedChatType("GROUP");
                                setSelectedGroup(group);
                                setSelectedUser("");
                            }}
                            className={`p-4 cursor-pointer border-b border-gray-800 hover:bg-[#202c33]
                            ${selectedChatType === "GROUP" && selectedGroup?.id === group.id ? "bg-[#202c33]" : ""}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-xl font-bold">
                                    👥
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold text-lg">
                                            {group.groupName}
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteGroup(group.id);
                                            }}
                                            className="text-red-400 hover:text-red-600 text-lg"
                                            title="Delete group"
                                        >
                                            🗑
                                        </button>
                                    </div>

                                    <div className="text-sm text-gray-400">
                                        Group chat
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">
                        No groups yet
                    </div>
                )}
            </div>
        </div>
    );
}

export default Sidebar;