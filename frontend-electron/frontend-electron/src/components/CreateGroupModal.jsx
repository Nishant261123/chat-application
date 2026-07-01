function CreateGroupModal({
    users,
    user,
    groupName,
    setGroupName,
    selectedMembers,
    setSelectedMembers,
    onCreateGroup,
    onClose
}) {
    const toggleMember = (name) => {
        setSelectedMembers((prev) =>
            prev.includes(name)
                ? prev.filter((item) => item !== name)
                : [...prev, name]
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-[#202c33] text-white w-[380px] rounded-2xl p-5">
                <h2 className="text-xl font-bold mb-4">Create Group</h2>

                <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name"
                    className="w-full p-3 rounded-lg text-black outline-none mb-4"
                />

                <div className="max-h-[250px] overflow-y-auto mb-4">
                    {users
                        .filter((u) => u.name !== user)
                        .map((u) => (
                            <label
                                key={u.name}
                                className="flex items-center gap-3 p-3 hover:bg-[#2a3942] rounded-lg cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedMembers.includes(u.name)}
                                    onChange={() => toggleMember(u.name)}
                                />

                                <span>{u.name}</span>
                            </label>
                        ))}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="bg-red-500 px-4 py-2 rounded-lg"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onCreateGroup}
                        className="bg-green-500 px-4 py-2 rounded-lg"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateGroupModal;