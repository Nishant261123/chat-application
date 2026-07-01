import SockJS from "sockjs-client";

import { Client } from "@stomp/stompjs";

let stompClient = null;
let isConnected = false;

export const connectWebSocket = (username, onMessageReceived) => {

    if (stompClient && isConnected) return;

    stompClient = new Client({

        webSocketFactory: () =>
            new SockJS("http://localhost:8080/chat"),

        reconnectDelay: 5000,

        debug: () => {},

        onConnect: () => {

            console.log("Connected as:", username);

            isConnected = true;

            stompClient.subscribe(
                `/topic/user/${username}`,
                (message) => {

                    const received =
                        JSON.parse(message.body);

                    console.log("Received:", received);

                    onMessageReceived(received);
                }
            );

            stompClient.subscribe(
                `/topic/user/${username}/typing`,
                (message) => {

                    const typingData =
                        JSON.parse(message.body);

                    window.dispatchEvent(
                        new CustomEvent("typing-event", {
                            detail: typingData
                        })
                    );
                }
            );
        },

        onStompError: (frame) => {
            console.log("STOMP error:", frame);
        },

        onWebSocketClose: () => {
            isConnected = false;
        }
    });

    stompClient.activate();
};

export const sendMessage = (message) => {

    console.log("Sending:", message);

    if (stompClient && isConnected) {

        stompClient.publish({
            destination: "/app/sendMessage",
            body: JSON.stringify(message)
        });

    } else {

        console.log("Socket not connected");
    }
};

export const sendTyping = (data) => {

    if (stompClient && isConnected) {

        stompClient.publish({
            destination: "/app/typing",
            body: JSON.stringify(data)
        });
    }
};

export const disconnectWebSocket = () => {

    if (stompClient) {
        stompClient.deactivate();
    }

    stompClient = null;
    isConnected = false;
};