import axios from "axios";
import { useRef, useState } from "react";

import { sendTyping } from "../websocket/socket";

function MessageInput({
    onSend,
    sender,
    receiver,
    disabled = false,
    disabledMessage = "Only admins can send messages"
}) {
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef(null);

    const isDisabled = disabled || uploading;

    const handleSend = () => {
        if (isDisabled) return;

        if (!message.trim()) return;

        onSend({
            content: message,
            messageType: "TEXT",
            fileUrl: "",
            fileName: ""
        });

        setMessage("");
    };

    const handleFileChange = async (e) => {
        if (disabled) return;

        const file = e.target.files[0];

        if (!file) return;

        try {
            setUploading(true);

            const formData = new FormData();

            formData.append("file", file);

            const response = await axios.post(
                "http://localhost:8080/api/files/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            const isImage =
                file.type.startsWith("image/");

            onSend({
                content: "",
                messageType: isImage ? "IMAGE" : "FILE",
                fileUrl: response.data.fileUrl,
                fileName: response.data.fileName
            });

            e.target.value = "";

        } catch (error) {
            console.log(error);
            alert("File upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-4 flex gap-3 shadow">
            <button
                onClick={() => {
                    if (!isDisabled) {
                        fileInputRef.current?.click();
                    }
                }}
                disabled={isDisabled}
                className={`px-4 rounded-full text-xl
                    ${
                        isDisabled
                            ? "bg-gray-100 opacity-60 cursor-not-allowed"
                            : "bg-gray-200 hover:bg-gray-300"
                    }
                `}
                title="Attach file"
            >
                📎
            </button>

            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
            />

            <input
                type="text"
                value={message}
                disabled={isDisabled}
                placeholder={
                    disabled
                        ? disabledMessage
                        : uploading
                            ? "Uploading..."
                            : "Type a message"
                }
                onChange={(e) => {
                    setMessage(e.target.value);

                    if (
                        !disabled &&
                        sender &&
                        receiver
                    ) {
                        sendTyping({
                            sender,
                            receiver
                        });
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSend();
                    }
                }}
                className={`flex-1 border rounded-full px-5 py-3 outline-none
                    ${
                        isDisabled
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : ""
                    }
                `}
            />

            <button
                onClick={handleSend}
                disabled={isDisabled}
                className={`text-white px-6 rounded-full
                    ${
                        isDisabled
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                    }
                `}
            >
                Send
            </button>
        </div>
    );
}

export default MessageInput;