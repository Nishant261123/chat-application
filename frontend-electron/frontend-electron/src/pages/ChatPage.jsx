import axios from "axios";
import { useEffect, useState, useRef } from "react";

import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import ReplyPreview from "../components/ReplyPreview";
import EditMessageBox from "../components/EditMessageBox";
import MessageList from "../components/MessageList";
import MessageContextMenu from "../components/MessageContextMenu";
import ForwardModal from "../components/ForwardModal";
import ImagePreviewModal from "../components/ImagePreviewModal";
import MessageInput from "../components/MessageInput";
import CreateGroupModal from "../components/CreateGroupModal";
import GroupInfoModal from "../components/GroupInfoModal";
import useGroupSeen from "../hooks/useGroupSeen";

import {
    connectWebSocket,
    sendMessage,
    disconnectWebSocket
} from "../websocket/socket";

function ChatPage({ user }) {
    const [messages, setMessages] = useState([]);
    const [allMessages, setAllMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [users, setUsers] = useState([]);
    const [typingUser, setTypingUser] = useState("");

    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedChatType, setSelectedChatType] = useState("PRIVATE");

    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);

    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [groupMembers, setGroupMembers] = useState([]);
    const [selectedNewMember, setSelectedNewMember] = useState("");

    const [showSeenInfo, setShowSeenInfo] = useState(false);
    const [seenUsers, setSeenUsers] = useState([]);

    const [openMenuId, setOpenMenuId] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    const [replyMessage, setReplyMessage] = useState(null);
    const [forwardMessage, setForwardMessage] = useState(null);

    const [editMessage, setEditMessage] = useState(null);
    const [editText, setEditText] = useState("");

    const [pinnedIds, setPinnedIds] = useState([]);
    const [starredIds, setStarredIds] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    const [hiddenIds, setHiddenIds] = useState(() => {
        const saved = localStorage.getItem(`${user}_hiddenMessages`);
        return saved ? JSON.parse(saved) : [];
    });

    const [blockedUsers, setBlockedUsers] = useState(() => {
        const saved = localStorage.getItem(`${user}_blockedUsers`);
        return saved ? JSON.parse(saved) : [];
    });

    const [previewImage, setPreviewImage] = useState(null);

    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const {
        groupSeenMap,
        loadSeenData,
        markGroupMessagesAsSeen
    } = useGroupSeen(user);

    const isSelectedUserBlocked =
        selectedChatType === "PRIVATE" &&
        blockedUsers.includes(selectedUser);

    useEffect(() => {
        localStorage.setItem(
            `${user}_hiddenMessages`,
            JSON.stringify(hiddenIds)
        );
    }, [hiddenIds, user]);

    useEffect(() => {
        localStorage.setItem(
            `${user}_blockedUsers`,
            JSON.stringify(blockedUsers)
        );
    }, [blockedUsers, user]);

    const formatLastSeen = (lastSeen) => {
        if (!lastSeen) return "Recently";

        return new Date(lastSeen).toLocaleString([], {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const selectedUserData = users.find((u) => u.name === selectedUser);

    const loadMessages = () => {
        if (!selectedUser) return;

        axios.get(`http://localhost:8080/api/messages/chat/${user}/${selectedUser}`)
            .then((response) => setMessages(response.data))
            .catch((error) => console.log("Messages load error:", error));
    };

    const loadGroupMessages = () => {
        if (!selectedGroup) return;

        axios.get(`http://localhost:8080/api/group-messages/${selectedGroup.id}`)
            .then((response) => {
                setMessages(response.data);
                markGroupMessagesAsSeen(response.data);
            })
            .catch((error) => console.log("Group messages load error:", error));
    };

    const loadAllMessages = () => {
        axios.get("http://localhost:8080/api/messages")
            .then((response) => setAllMessages(response.data))
            .catch((error) => console.log("All messages load error:", error));
    };

    const loadUsers = () => {
        axios.get("http://localhost:8080/api/auth/users")
            .then((response) => setUsers(response.data))
            .catch((error) => console.log(error));
    };

    const loadGroups = () => {
        axios.get(`http://localhost:8080/api/groups/user/${user}`)
            .then((response) => setGroups(response.data))
            .catch((error) => console.log("Groups load error:", error));
    };

    const loadGroupMembers = async () => {
        if (!selectedGroup) return;

        try {
            const response = await axios.get(
                `http://localhost:8080/api/groups/${selectedGroup.id}/members`
            );

            setGroupMembers(response.data);
        } catch (error) {
            console.log("Group members load error:", error);
        }
    };

    const openGroupInfo = async () => {
        await loadGroupMembers();
        setShowGroupInfo(true);
    };

    const makeUserOnline = () => {
        if (!user) return;

        axios.post(`http://localhost:8080/api/auth/online/${user}`)
            .then(() => loadUsers())
            .catch((error) => console.log("Online error:", error));
    };

    const makeUserOffline = () => {
        if (!user) return;

        navigator.sendBeacon(
            `http://localhost:8080/api/auth/offline/${user}`
        );
    };

    useEffect(() => {
        makeUserOnline();

        const handleBeforeUnload = () => {
            makeUserOffline();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [user]);

    useEffect(() => {
        connectWebSocket(user, (message) => {
            if (blockedUsers.includes(message.sender)) return;

            if (message.groupId) {
                if (
                    selectedChatType === "GROUP" &&
                    selectedGroup &&
                    message.groupId === selectedGroup.id
                ) {
                    setMessages((prev) => {
                        const exists = prev.some(
                            (msg) => msg.id === message.id
                        );

                        if (exists) {
                            return prev.map((msg) =>
                                msg.id === message.id
                                    ? message
                                    : msg
                            );
                        }

                        return [...prev, message];
                    });

                    loadSeenData(message.id);
                    markGroupMessagesAsSeen([message]);
                }

                return;
            }

            setAllMessages((prev) => {
                const exists = prev.some((msg) => msg.id === message.id);

                if (exists) {
                    return prev.map((msg) =>
                        msg.id === message.id ? message : msg
                    );
                }

                return [...prev, message];
            });

            const isCurrentChat =
                selectedChatType === "PRIVATE" &&
                (
                    (message.sender === user && message.receiver === selectedUser) ||
                    (message.sender === selectedUser && message.receiver === user)
                );

            if (!isCurrentChat) return;

            setMessages((prev) => {
                const exists = prev.some((msg) => msg.id === message.id);

                if (exists) {
                    return prev.map((msg) =>
                        msg.id === message.id ? message : msg
                    );
                }

                return [...prev, message];
            });
        });

        return () => {
            disconnectWebSocket();
        };
    }, [
        user,
        selectedUser,
        selectedGroup,
        selectedChatType,
        blockedUsers,
        loadSeenData,
        markGroupMessagesAsSeen
    ]);

    useEffect(() => {
        const handleTyping = (event) => {
            const data = event.detail;

            if (selectedChatType !== "PRIVATE") {
                setTypingUser("");
                return;
            }

            if (blockedUsers.includes(data.sender)) return;

            if (data.sender === selectedUser && data.receiver === user) {
                setTypingUser(data.sender);

                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                typingTimeoutRef.current = setTimeout(() => {
                    setTypingUser("");
                }, 1000);
            }
        };

        window.addEventListener("typing-event", handleTyping);

        return () => {
            window.removeEventListener("typing-event", handleTyping);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [selectedUser, user, blockedUsers, selectedChatType]);

    useEffect(() => {
        if (selectedChatType === "GROUP") {
            setTypingUser("");
        }
    }, [selectedChatType]);

    useEffect(() => {
        loadUsers();
        loadAllMessages();
        loadGroups();

        const interval = setInterval(() => {
            loadUsers();
            loadAllMessages();
            loadGroups();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedUser || selectedChatType === "GROUP") return;

        const savedChat = localStorage.getItem(`${user}_selectedChat`);
        const otherUsers = users.filter((u) => u.name !== user);

        if (savedChat) {
            setSelectedUser(savedChat);
            setSelectedChatType("PRIVATE");
        } else if (otherUsers.length > 0) {
            setSelectedUser(otherUsers[0].name);
            setSelectedChatType("PRIVATE");
        }
    }, [users, user, selectedUser, selectedChatType]);

    useEffect(() => {
        if (selectedChatType === "GROUP") {
            loadGroupMessages();
        } else {
            loadMessages();
        }
    }, [selectedUser, selectedGroup, selectedChatType]);

    const filteredMessages = messages.filter((msg) => {
        if (hiddenIds.includes(msg.id)) return false;

        if (selectedChatType === "GROUP") {
            return msg.groupId === selectedGroup?.id;
        }

        if (
            blockedUsers.includes(msg.sender) &&
            msg.receiver === user
        ) {
            return false;
        }

        return (
            msg.sender === user &&
            msg.receiver === selectedUser
        ) || (
            msg.sender === selectedUser &&
            msg.receiver === user
        );
    });

    useEffect(() => {
        if (selectedChatType === "GROUP") return;

        messages.forEach((msg) => {
            const isCurrentChat =
                msg.sender === selectedUser &&
                msg.receiver === user;

            if (
                isCurrentChat &&
                msg.id &&
                !msg.seen &&
                msg.messageType !== "DELETED" &&
                !blockedUsers.includes(msg.sender)
            ) {
                axios.put(`http://localhost:8080/api/messages/seen/${msg.id}`)
                    .then((response) => {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === response.data.id
                                    ? response.data
                                    : m
                            )
                        );

                        setAllMessages((prev) =>
                            prev.map((m) =>
                                m.id === response.data.id
                                    ? response.data
                                    : m
                            )
                        );
                    })
                    .catch((error) => console.log(error));
            }
        });
    }, [messages, user, selectedUser, blockedUsers, selectedChatType]);

    useEffect(() => {
        if ((selectedUser || selectedGroup) && filteredMessages.length > 0) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({
                    behavior: "auto"
                });
            }, 100);
        }
    }, [selectedUser, selectedGroup, filteredMessages.length]);

    const unreadCounts = {};

    allMessages.forEach((msg) => {
        if (
            msg.receiver === user &&
            !msg.seen &&
            msg.messageType !== "DELETED" &&
            !blockedUsers.includes(msg.sender)
        ) {
            unreadCounts[msg.sender] =
                (unreadCounts[msg.sender] || 0) + 1;
        }
    });

    const getMessageText = (msg) => {
        if (msg.messageType === "IMAGE") return msg.fileName || "Image";
        if (msg.messageType === "FILE") return msg.fileName || "File";
        if (msg.messageType === "VOICE") return msg.fileName || "Voice note";
        if (msg.messageType === "SYSTEM") return msg.content || "System message";
        if (msg.messageType === "DELETED") return msg.content || "Deleted message";

        return msg.content || "";
    };

    const handleOpenSeenInfo = (seenList) => {
        setSeenUsers(seenList);
        setShowSeenInfo(true);
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            alert("Enter group name");
            return;
        }

        try {
            await axios.post("http://localhost:8080/api/groups/create", {
                groupName: groupName.trim(),
                createdBy: user,
                members: selectedMembers
            });

            setGroupName("");
            setSelectedMembers([]);
            setShowCreateGroup(false);

            loadGroups();

            alert("Group created successfully");
        } catch (error) {
            console.log("Create group error:", error);
            alert("Group creation failed");
        }
    };

    const handleDeleteGroup = async (groupId) => {
        const confirmDelete = window.confirm(
            "Delete this group? All group messages will also be deleted."
        );

        if (!confirmDelete) return;

        try {
            await axios.delete(`http://localhost:8080/api/groups/${groupId}`);

            setGroups((prev) =>
                prev.filter((group) => group.id !== groupId)
            );

            if (selectedGroup?.id === groupId) {
                setSelectedGroup(null);
                setMessages([]);
                setSelectedChatType("PRIVATE");

                const otherUsers = users.filter((u) => u.name !== user);

                if (otherUsers.length > 0) {
                    setSelectedUser(otherUsers[0].name);
                }
            }

            alert("Group deleted successfully");
        } catch (error) {
            console.log("Delete group error:", error);
            alert("Failed to delete group");
        }
    };

    const handleAddMember = async () => {
        if (!selectedGroup || !selectedNewMember) {
            alert("Select member");
            return;
        }

        try {
            await axios.post(
                `http://localhost:8080/api/groups/${selectedGroup.id}/add-member`,
                {
                    userName: selectedNewMember,
                    addedBy: user
                }
            );

            setSelectedNewMember("");
            await loadGroupMembers();
            loadGroups();
            loadGroupMessages();

            alert("Member added successfully");
        } catch (error) {
            console.log("Add member error:", error);
            alert("Failed to add member");
        }
    };

    const handleRemoveMember = async (memberName) => {
        if (!selectedGroup) return;

        const confirmRemove = window.confirm(
            `Remove ${memberName} from group?`
        );

        if (!confirmRemove) return;

        try {
            await axios.delete(
                `http://localhost:8080/api/groups/${selectedGroup.id}/remove-member/${memberName}/${user}`
            );

            await loadGroupMembers();
            loadGroupMessages();

            alert("Member removed successfully");
        } catch (error) {
            console.log("Remove member error:", error);
            alert("Failed to remove member");
        }
    };

    const handleLeaveGroup = async () => {
        if (!selectedGroup) return;

        const confirmLeave = window.confirm(
            "Are you sure you want to leave this group?"
        );

        if (!confirmLeave) return;

        try {
            await axios.delete(
                `http://localhost:8080/api/groups/${selectedGroup.id}/leave/${user}`
            );

            setGroups((prev) =>
                prev.filter((group) => group.id !== selectedGroup.id)
            );

            setShowGroupInfo(false);
            setSelectedGroup(null);
            setMessages([]);
            setSelectedChatType("PRIVATE");

            const otherUsers = users.filter((u) => u.name !== user);

            if (otherUsers.length > 0) {
                setSelectedUser(otherUsers[0].name);
            }

            alert("You left the group");
        } catch (error) {
            console.log("Leave group error:", error);
            alert("Admin must transfer admin before leaving");
        }
    };

    const handleTransferAdmin = async (newAdmin) => {
        if (!selectedGroup) return;

        const confirmTransfer = window.confirm(
            `Transfer admin to ${newAdmin}?`
        );

        if (!confirmTransfer) return;

        try {
            const response = await axios.put(
                `http://localhost:8080/api/groups/${selectedGroup.id}/transfer-admin`,
                {
                    newAdmin: newAdmin
                }
            );

            setSelectedGroup(response.data);
            await loadGroupMembers();
            loadGroups();
            loadGroupMessages();

            alert("Admin transferred successfully");
        } catch (error) {
            console.log("Transfer admin error:", error);
            alert("Failed to transfer admin");
        }
    };

    const handleToggleAnnouncementMode = async (enabled) => {
        if (!selectedGroup) return;

        try {
            const response = await axios.put(
                `http://localhost:8080/api/groups/${selectedGroup.id}/announcement-mode`,
                {
                    onlyAdminCanSend: enabled
                }
            );

            setSelectedGroup(response.data);
            loadGroups();
            loadGroupMessages();

            alert(
                enabled
                    ? "Announcement mode enabled"
                    : "Announcement mode disabled"
            );
        } catch (error) {
            console.log("Announcement mode error:", error);
            alert("Failed to update announcement mode");
        }
    };

    const handleSend = (data) => {
        if (selectedChatType === "GROUP") {
            if (!selectedGroup) return;

            axios.post("http://localhost:8080/api/group-messages/send", {
                groupId: selectedGroup.id,
                sender: user,
                content: data.content || "",
                messageType: data.messageType || "TEXT",
                fileUrl: data.fileUrl || "",
                fileName: data.fileName || ""
            })
                .then(() => loadGroupMessages())
                .catch((error) => {
                    console.log("Group send error:", error);

                    if (
                        error.response &&
                        error.response.data &&
                        error.response.data.message
                    ) {
                        alert(error.response.data.message);
                    } else {
                        alert("Only admin can send messages in this group");
                    }
                });

            return;
        }

        if (!selectedUser) return;

        if (isSelectedUserBlocked) {
            alert(`Unblock ${selectedUser} to send message`);
            return;
        }

        const replyText =
            replyMessage
                ? `↩ Reply to ${replyMessage.sender}: ${getMessageText(replyMessage)}\n`
                : "";

        const message = {
            sender: user,
            receiver: selectedUser,
            content: replyText + (data.content || ""),
            timestamp: new Date().toISOString(),
            delivered: false,
            seen: false,
            edited: false,
            reaction: "",
            messageType: data.messageType || "TEXT",
            fileUrl: data.fileUrl || "",
            fileName: data.fileName || ""
        };

        sendMessage(message);
        setReplyMessage(null);

        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth"
            });

            loadMessages();
            loadAllMessages();
        }, 200);
    };

    const closeMenu = () => {
        setOpenMenuId(null);
    };

    const handleRightClick = (e, msg, index) => {
        e.preventDefault();

        let x = e.clientX;
        let y = e.clientY;

        const menuHeight = 450;
        const menuWidth = 220;

        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth - 20;
        }

        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight - 20;
        }

        setOpenMenuId(msg.id || index);
        setMenuPosition({ x, y });
    };

    const handleCopy = async (msg) => {
        await navigator.clipboard.writeText(getMessageText(msg));
        closeMenu();
    };

    const handleReply = (msg) => {
        setReplyMessage(msg);
        closeMenu();
    };

    const handleStartEdit = (msg) => {
        if (selectedChatType === "GROUP") {
            alert("Edit for group messages will be added later");
            return;
        }

        setEditMessage(msg);
        setEditText(msg.content || "");
        closeMenu();
    };

    const handleCancelEdit = () => {
        setEditMessage(null);
        setEditText("");
    };

    const handleSaveEdit = async () => {
        if (!editMessage) return;

        if (!editText.trim()) {
            alert("Message cannot be empty");
            return;
        }

        try {
            const response = await axios.put(
                `http://localhost:8080/api/messages/edit/${editMessage.id}`,
                {
                    content: editText.trim()
                }
            );

            setMessages((prev) =>
                prev.map((m) =>
                    m.id === response.data.id
                        ? response.data
                        : m
                )
            );

            setAllMessages((prev) =>
                prev.map((m) =>
                    m.id === response.data.id
                        ? response.data
                        : m
                )
            );

            setEditMessage(null);
            setEditText("");
        } catch (error) {
            console.log("Edit error:", error);
            alert("Edit failed");
        }
    };

    const handleReaction = async (msg, emoji) => {
        if (msg.messageType === "SYSTEM") {
            return;
        }

        try {
            if (selectedChatType === "GROUP") {
                const response = await axios.put(
                    `http://localhost:8080/api/group-messages/reaction/${msg.id}`,
                    {
                        reaction: emoji
                    }
                );

                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === response.data.id
                            ? response.data
                            : m
                    )
                );

                closeMenu();
                return;
            }

            const response = await axios.put(
                `http://localhost:8080/api/messages/reaction/${msg.id}`,
                {
                    reaction: emoji
                }
            );

            setMessages((prev) =>
                prev.map((m) =>
                    m.id === response.data.id
                        ? response.data
                        : m
                )
            );

            setAllMessages((prev) =>
                prev.map((m) =>
                    m.id === response.data.id
                        ? response.data
                        : m
                )
            );

            closeMenu();
        } catch (error) {
            console.log("Reaction error:", error);
            alert("Reaction failed");
        }
    };

    const handleForwardConfirm = (receiverName) => {
        if (!forwardMessage) return;

        if (blockedUsers.includes(receiverName)) {
            alert(`Unblock ${receiverName} to forward message`);
            return;
        }

        const message = {
            sender: user,
            receiver: receiverName,
            content: forwardMessage.content || "",
            timestamp: new Date().toISOString(),
            delivered: false,
            seen: false,
            edited: false,
            reaction: "",
            messageType: forwardMessage.messageType || "TEXT",
            fileUrl: forwardMessage.fileUrl || "",
            fileName: forwardMessage.fileName || ""
        };

        sendMessage(message);

        setForwardMessage(null);
        closeMenu();

        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth"
            });

            loadMessages();
            loadAllMessages();
        }, 200);
    };

    const handlePin = (msg) => {
        setPinnedIds((prev) =>
            prev.includes(msg.id)
                ? prev.filter((id) => id !== msg.id)
                : [...prev, msg.id]
        );

        closeMenu();
    };

    const handleStar = (msg) => {
        setStarredIds((prev) =>
            prev.includes(msg.id)
                ? prev.filter((id) => id !== msg.id)
                : [...prev, msg.id]
        );

        closeMenu();
    };

    const handleSelect = (msg) => {
        setSelectedIds((prev) =>
            prev.includes(msg.id)
                ? prev.filter((id) => id !== msg.id)
                : [...prev, msg.id]
        );

        closeMenu();
    };

    const handleDeleteForMe = (msg) => {
        setHiddenIds((prev) => [...new Set([...prev, msg.id])]);
        closeMenu();
    };

    const handleDeleteForEveryone = async (msg) => {
        if (selectedChatType === "GROUP") {
            alert("Delete for group messages will be added later");
            return;
        }

        try {
            const response = await axios.delete(
                `http://localhost:8080/api/messages/${msg.id}`
            );

            const deletedMessage = response.data;

            setMessages((prev) =>
                prev.map((m) =>
                    m.id === msg.id
                        ? {
                            ...deletedMessage,
                            content:
                                msg.sender === user
                                    ? "You deleted this message"
                                    : "This message was deleted"
                        }
                        : m
                )
            );

            setAllMessages((prev) =>
                prev.map((m) =>
                    m.id === deletedMessage.id
                        ? deletedMessage
                        : m
                )
            );

            closeMenu();
        } catch (error) {
            console.log("Delete error:", error);
            alert("Delete failed");
        }
    };

    const handleReportChat = () => {
        if (selectedChatType === "GROUP") {
            alert(`Reported group ${selectedGroup?.groupName}`);
            return;
        }

        if (!selectedUser) return;
        alert(`Reported ${selectedUser}`);
    };

    const handleBlockUser = () => {
        if (selectedChatType === "GROUP") {
            alert("Block is only for private chat");
            return;
        }

        if (!selectedUser) return;

        if (blockedUsers.includes(selectedUser)) {
            setBlockedUsers((prev) =>
                prev.filter((name) => name !== selectedUser)
            );

            alert(`${selectedUser} unblocked`);
            return;
        }

        const confirmBlock = window.confirm(
            `Block ${selectedUser}? You will not receive messages from this user.`
        );

        if (!confirmBlock) return;

        setBlockedUsers((prev) => [...new Set([...prev, selectedUser])]);
        setTypingUser("");
        alert(`${selectedUser} blocked`);
    };

    const handleClearChat = async () => {
        if (selectedChatType === "GROUP") {
            alert("Clear group chat will be added later");
            return;
        }

        if (!selectedUser) return;

        const confirmClear = window.confirm(
            `Clear chat with ${selectedUser}? This will delete messages from backend.`
        );

        if (!confirmClear) return;

        try {
            await axios.delete(
                `http://localhost:8080/api/messages/chat/${user}/${selectedUser}`
            );

            setMessages([]);
            setHiddenIds([]);

            setAllMessages((prev) =>
                prev.filter(
                    (msg) =>
                        !(
                            (msg.sender === user && msg.receiver === selectedUser) ||
                            (msg.sender === selectedUser && msg.receiver === user)
                        )
                )
            );

            alert("Chat cleared successfully");
        } catch (error) {
            console.log("Clear chat error:", error);
            alert("Failed to clear chat");
        }
    };

    return (
        <div className="h-screen flex overflow-hidden" onClick={closeMenu}>
            <Sidebar
                user={user}
                users={users}
                groups={groups}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                selectedGroup={selectedGroup}
                setSelectedGroup={setSelectedGroup}
                selectedChatType={selectedChatType}
                setSelectedChatType={setSelectedChatType}
                setShowCreateGroup={setShowCreateGroup}
                handleDeleteGroup={handleDeleteGroup}
                formatLastSeen={formatLastSeen}
                disconnectWebSocket={disconnectWebSocket}
                unreadCounts={unreadCounts}
            />

            <div className="flex-1 flex flex-col bg-[#efeae2]">
                <ChatHeader
                    selectedUser={
                        selectedChatType === "GROUP"
                            ? selectedGroup?.groupName
                            : selectedUser
                    }
                    selectedUserData={
                        selectedChatType === "GROUP"
                            ? null
                            : selectedUserData
                    }
                    formatLastSeen={formatLastSeen}
                    isBlocked={isSelectedUserBlocked}
                    selectedChatType={selectedChatType}
                    onOpenGroupInfo={openGroupInfo}
                    onReport={handleReportChat}
                    onBlock={handleBlockUser}
                    onClearChat={handleClearChat}
                />

                <ReplyPreview
                    replyMessage={replyMessage}
                    getMessageText={getMessageText}
                    setReplyMessage={setReplyMessage}
                />

                <EditMessageBox
                    editMessage={editMessage}
                    editText={editText}
                    setEditText={setEditText}
                    handleSaveEdit={handleSaveEdit}
                    handleCancelEdit={handleCancelEdit}
                />

                {
                    isSelectedUserBlocked && (
                        <div className="bg-yellow-100 text-yellow-800 text-center py-2 text-sm">
                            You blocked {selectedUser}. Unblock to send and receive messages.
                        </div>
                    )
                }

                <MessageList
                    filteredMessages={filteredMessages}
                    user={user}
                    pinnedIds={pinnedIds}
                    starredIds={starredIds}
                    selectedIds={selectedIds}
                    setPreviewImage={setPreviewImage}
                    handleRightClick={handleRightClick}
                    typingUser={
                        selectedChatType === "PRIVATE" && selectedUser
                            ? typingUser
                            : ""
                    }
                    selectedUser={
                        selectedChatType === "PRIVATE"
                            ? selectedUser
                            : ""
                    }
                    groupSeenMap={groupSeenMap}
                    onOpenSeenInfo={handleOpenSeenInfo}
                    messagesEndRef={messagesEndRef}
                />

                <MessageInput
                    onSend={handleSend}
                    sender={user}
                    receiver={
                        selectedChatType === "GROUP"
                            ? selectedGroup?.groupName
                            : selectedUser
                    }
                    disabled={
                        selectedChatType === "GROUP" &&
                        selectedGroup?.onlyAdminCanSend &&
                        selectedGroup?.createdBy !== user
                    }
                    disabledMessage="Only admins can send messages"
                />
            </div>

            <MessageContextMenu
                openMenuId={openMenuId}
                menuPosition={menuPosition}
                filteredMessages={filteredMessages}
                pinnedIds={pinnedIds}
                starredIds={starredIds}
                selectedIds={selectedIds}
                handleReply={handleReply}
                handleStartEdit={handleStartEdit}
                handleCopy={handleCopy}
                setForwardMessage={setForwardMessage}
                closeMenu={closeMenu}
                handleReaction={handleReaction}
                handlePin={handlePin}
                handleStar={handleStar}
                handleSelect={handleSelect}
                handleDeleteForMe={handleDeleteForMe}
                handleDeleteForEveryone={handleDeleteForEveryone}
                user={user}
            />

            <ForwardModal
                forwardMessage={forwardMessage}
                users={users}
                user={user}
                handleForwardConfirm={handleForwardConfirm}
                setForwardMessage={setForwardMessage}
            />

            <ImagePreviewModal
                previewImage={previewImage}
                setPreviewImage={setPreviewImage}
            />

            {
                showCreateGroup && (
                    <CreateGroupModal
                        users={users}
                        user={user}
                        groupName={groupName}
                        setGroupName={setGroupName}
                        selectedMembers={selectedMembers}
                        setSelectedMembers={setSelectedMembers}
                        onCreateGroup={handleCreateGroup}
                        onClose={() => setShowCreateGroup(false)}
                    />
                )
            }

            {
                showGroupInfo && (
                    <GroupInfoModal
                        group={selectedGroup}
                        members={groupMembers}
                        users={users}
                        currentUser={user}
                        selectedNewMember={selectedNewMember}
                        setSelectedNewMember={setSelectedNewMember}
                        onAddMember={handleAddMember}
                        onRemoveMember={handleRemoveMember}
                        onLeaveGroup={handleLeaveGroup}
                        onTransferAdmin={handleTransferAdmin}
                        onToggleAnnouncementMode={handleToggleAnnouncementMode}
                        onClose={() => setShowGroupInfo(false)}
                    />
                )
            }

            {
                showSeenInfo && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                        <div className="bg-[#202c33] text-white w-[350px] rounded-2xl p-5 relative">
                            <button
                                onClick={() => setShowSeenInfo(false)}
                                className="absolute top-3 right-4 text-2xl hover:text-red-400"
                            >
                                ×
                            </button>

                            <h2 className="text-xl font-bold mb-4">
                                Seen By
                            </h2>

                            {
                                seenUsers.length > 0 ? (
                                    seenUsers.map((seen) => (
                                        <div
                                            key={seen.id}
                                            className="border-b border-gray-700 py-3"
                                        >
                                            <div className="font-semibold">
                                                👤 {seen.userName}
                                            </div>

                                            <div className="text-xs text-gray-400">
                                                {
                                                    seen.seenAt
                                                        ? new Date(seen.seenAt).toLocaleString()
                                                        : ""
                                                }
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-400">
                                        Nobody has seen this message yet
                                    </div>
                                )
                            }
                        </div>
                    </div>
                )
            }
        </div>
    );
}

export default ChatPage;