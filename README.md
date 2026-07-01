# 💬 Chat Application

A real-time desktop chat application built with **React**, **Electron**, **Spring Boot**, **WebSocket**, and **PostgreSQL**. It supports private messaging, group chats, file sharing, reactions, voice messages, and many other modern chat features.

---

## 🚀 Features

### 👤 User Authentication
- User Registration
- User Login
- Secure Authentication

### 💬 One-to-One Chat
- Real-time messaging using WebSocket
- Online / Offline status
- Last Seen
- Typing Indicator
- Read Receipts (Blue Tick)
- Reply to Messages
- Edit Messages
- Delete Messages
- Delete for Everyone
- Copy Messages
- Forward Messages

### 😊 Message Features
- Emoji Reactions
- Star Messages
- Pin Messages
- Date-wise Message Grouping
- Today / Yesterday Labels

### 📁 Media Sharing
- Image Upload
- File Upload
- Voice Messages
- Image Preview

### 👥 Group Chat
- Create Group
- Add Members
- Remove Members
- Transfer Admin
- Leave Group
- Delete Group
- Group Reactions
- Group Read Receipts

### 🛡️ User Management
- Report User
- Block / Unblock User
- Clear Chat

---

# 🛠️ Tech Stack

## Frontend
- React
- Electron
- Vite
- JavaScript
- CSS
- SockJS
- STOMP.js

## Backend
- Spring Boot
- Java
- Spring WebSocket
- Spring Data JPA
- Spring Security
- Maven

## Database
- PostgreSQL

---

# 📁 Project Structure

```text
chat-application/
│
├── frontend-electron/
│   ├── src/
│   ├── electron/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── chat-backend/
│   ├── src/
│   ├── pom.xml
│   ├── mvnw
│   └── ...
│
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/Nishant261123/chat-application.git

cd chat-application
```

---

## 2️⃣ Backend Setup

```bash
cd chat-backend
```

Configure PostgreSQL in:

```
src/main/resources/application.properties
```

Run:

```bash
mvn spring-boot:run
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend-electron
```

Install dependencies

```bash
npm install
```

Run

```bash
npm run dev
```

For Electron

```bash
npm run electron
```

---

# 📸 Screenshots

Add screenshots here.

Example:

```
screenshots/
    login.png
    register.png
    chat.png
    group-chat.png
```

Example:

```md
## Login

![Login](screenshots/login.png)

## Chat Window

![Chat](screenshots/chat.png)
```

---

# 🔮 Future Enhancements

- Video Calling
- Audio Calling
- Message Search
- Message Encryption
- Push Notifications
- Multi-device Login
- Dark / Light Theme
- Chat Backup
- Message Scheduling

---

# 👨‍💻 Author

**Nishant Mohite**

GitHub:
https://github.com/Nishant261123

LinkedIn:
(Add your LinkedIn profile here)

---

# ⭐ Support

If you like this project, please consider giving it a ⭐ on GitHub.
