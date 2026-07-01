function GroupInfoModal({
    group,
    members,
    users,
    currentUser,
    selectedNewMember,
    setSelectedNewMember,
    onAddMember,
    onRemoveMember,
    onLeaveGroup,
    onTransferAdmin,
    onToggleAnnouncementMode,
    onClose
}) {
    if (!group) return null;

    const isAdmin = currentUser === group.createdBy;

    const availableUsers = users.filter(
        (u) => !members.some((m) => m.userName === u.name)
    );

    const transferMembers = members.filter(
        (member) => member.userName !== group.createdBy
    );

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-[#202c33] text-white w-[430px] rounded-2xl p-5 relative">

                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl font-bold"
                >
                    ×
                </button>

                <h2 className="text-xl font-bold mb-4">
                    👥 Group Info
                </h2>

                <div className="mb-5">
                    <div className="w-20 h-20 rounded-full bg-purple-500 flex items-center justify-center text-3xl mx-auto mb-3">
                        👥
                    </div>

                    <div className="text-center text-xl font-bold">
                        {group.groupName}
                    </div>

                    <div className="text-center text-sm text-gray-400">
                        Created by {group.createdBy}
                    </div>
                </div>

                {isAdmin && (
                    <div className="mb-4 flex gap-2">
                        <select
                            value={selectedNewMember}
                            onChange={(e) => setSelectedNewMember(e.target.value)}
                            className="flex-1 p-2 rounded text-black"
                        >
                            <option value="">Select member</option>

                            {availableUsers.map((u) => (
                                <option key={u.name} value={u.name}>
                                    {u.name}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={onAddMember}
                            className="bg-green-500 hover:bg-green-600 px-3 rounded"
                        >
                            Add
                        </button>
                    </div>
                )}

                {isAdmin && (
                    <div className="mb-4">
                        <select
                            defaultValue=""
                            onChange={(e) => {
                                if (e.target.value) {
                                    onTransferAdmin(e.target.value);
                                    e.target.value = "";
                                }
                            }}
                            className="w-full p-2 rounded text-black"
                        >
                            <option value="">Transfer admin to...</option>

                            {transferMembers.map((member) => (
                                <option key={member.id} value={member.userName}>
                                    {member.userName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {isAdmin && (
                    <div className="mb-4 bg-[#111b21] p-3 rounded-lg">
                        <label className="flex items-center justify-between gap-3">
                            <span className="font-medium">
                                📢 Only Admins Can Send Messages
                            </span>

                            <input
                                type="checkbox"
                                checked={group.onlyAdminCanSend || false}
                                onChange={(e) =>
                                    onToggleAnnouncementMode(e.target.checked)
                                }
                                className="w-5 h-5 cursor-pointer"
                            />
                        </label>

                        <div className="text-xs text-gray-400 mt-2">
                            When enabled, only group admins can send messages.
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <h3 className="font-semibold mb-2">
                        Members
                    </h3>

                    {members.length > 0 ? (
                        members.map((member) => (
                            <div
                                key={member.id}
                                className="p-3 border-b border-gray-700 flex items-center justify-between"
                            >
                                <span>
                                    {member.userName === group.createdBy
                                        ? `👑 ${member.userName}`
                                        : `👤 ${member.userName}`}
                                </span>

                                {member.userName === group.createdBy ? (
                                    <span className="text-xs bg-green-500 px-2 py-1 rounded-full">
                                        Admin
                                    </span>
                                ) : (
                                    isAdmin && (
                                        <button
                                            onClick={() => onRemoveMember(member.userName)}
                                            className="text-red-400 hover:text-red-600 text-sm"
                                        >
                                            Remove
                                        </button>
                                    )
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400 text-sm">
                            No members found
                        </div>
                    )}
                </div>

                <button
                    onClick={onLeaveGroup}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 py-2 rounded-lg mb-3"
                >
                    🚪 Leave Group
                </button>

                <button
                    onClick={onClose}
                    className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-lg"
                >
                    Close
                </button>
            </div>
        </div>
    );
}

export default GroupInfoModal;