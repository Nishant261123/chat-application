import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";

import RegisterPage from "./pages/RegisterPage";

import ChatPage from "./pages/ChatPage";

function App() {

    const user =
        localStorage.getItem(
            "chatUser"
        );

    return (

        <Routes>

            <Route

                path="/"

                element={

                    user

                        ?

                        <ChatPage user={user} />

                        :

                        <Navigate to="/login" />
                }
            />

            <Route

                path="/login"

                element={<LoginPage />}
            />

            <Route

                path="/register"

                element={<RegisterPage />}
            />

        </Routes>
    );
}

export default App;