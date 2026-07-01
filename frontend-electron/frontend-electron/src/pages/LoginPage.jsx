import axios from "axios";

import {
    useRef,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

function LoginPage() {

    const navigate =
        useNavigate();

    const passwordRef =
        useRef(null);

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState("");

    // =========================
    // VALIDATION
    // =========================

    const validateForm = () => {

        if (!email.trim()) {

            return "Email is required";
        }

        if (!email.includes("@")) {

            return "Enter valid email";
        }

        if (!password.trim()) {

            return "Password is required";
        }

        if (password.length < 4) {

            return "Password must be at least 4 characters";
        }

        return "";
    };

    // =========================
    // LOGIN
    // =========================

    const handleLogin = async () => {

        const validationError =
            validateForm();

        if (validationError) {

            setError(validationError);

            return;
        }

        try {

            const response =
                await axios.post(

                    "http://localhost:8080/api/auth/login",

                    {
                        email:
                            email.trim().toLowerCase(),

                        password:
                            password.trim()
                    }
                );

            console.log(response.data);

            // SAVE USER

            localStorage.setItem(

                "chatUser",

                response.data.name
            );

            // GO CHAT PAGE

            navigate("/");

            // REFRESH

            window.location.reload();

        } catch (error) {

            console.log(error);

            setError(
                "Invalid email or password"
            );
        }
    };

    return (

        <div className="h-screen flex items-center justify-center bg-[#111b21]">

            <div className="bg-[#202c33] p-10 rounded-2xl w-[400px] text-white shadow-2xl">

                {/* TITLE */}

                <h1 className="text-3xl font-bold mb-8 text-center">

                    Chat Login

                </h1>

                {/* ERROR */}

                {
                    error && (

                        <div className="mb-4 bg-red-500/20 text-red-300 p-3 rounded-lg text-sm">

                            {error}

                        </div>
                    )
                }

                {/* EMAIL */}

                <input
                    type="email"

                    placeholder="Enter email"

                    value={email}

                    onChange={(e) => {

                        setEmail(
                            e.target.value
                        );

                        setError("");
                    }}

                    onKeyDown={(e) => {

                        if (
                            e.key === "Enter"
                        ) {

                            passwordRef
                                .current
                                ?.focus();
                        }
                    }}

                    className="w-full mb-4 p-4 rounded-lg bg-[#2a3942] outline-none border border-transparent focus:border-green-500"
                />

                {/* PASSWORD */}

                <input
                    ref={passwordRef}

                    type="password"

                    placeholder="Enter password"

                    value={password}

                    onChange={(e) => {

                        setPassword(
                            e.target.value
                        );

                        setError("");
                    }}

                    onKeyDown={(e) => {

                        if (
                            e.key === "Enter"
                        ) {

                            handleLogin();
                        }
                    }}

                    className="w-full mb-6 p-4 rounded-lg bg-[#2a3942] outline-none border border-transparent focus:border-green-500"
                />

                {/* LOGIN BUTTON */}

                <button

                    onClick={handleLogin}

                    className="w-full bg-green-500 hover:bg-green-600 transition-all p-4 rounded-lg font-semibold text-lg"
                >
                    Login
                </button>

                {/* REGISTER */}

                <p className="mt-5 text-center text-gray-300">

                    No account?

                    <Link

                        to="/register"

                        className="text-green-400 ml-2 hover:underline"
                    >
                        Register
                    </Link>

                </p>

            </div>

        </div>
    );
}

export default LoginPage;