import axios from "axios";
import { useState } from "react";

function useGroupSeen(user) {
    const [groupSeenMap, setGroupSeenMap] = useState({});

    const loadSeenData = async (messageId) => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/group-messages/seen/${messageId}`
            );

            setGroupSeenMap((prev) => ({
                ...prev,
                [messageId]: response.data
            }));
        } catch (error) {
            console.log("Seen data load error:", error);
        }
    };

    const markGroupMessagesAsSeen = async (messages) => {
        for (const msg of messages) {
            if (!msg.id) continue;

            if (
                msg.sender !== user &&
                msg.messageType !== "SYSTEM" &&
                msg.messageType !== "DELETED"
            ) {
                await axios.post(
                    `http://localhost:8080/api/group-messages/seen/${msg.id}/${user}`
                ).catch(() => {});
            }

            await loadSeenData(msg.id);
        }
    };

    return {
        groupSeenMap,
        loadSeenData,
        markGroupMessagesAsSeen
    };
}

export default useGroupSeen;