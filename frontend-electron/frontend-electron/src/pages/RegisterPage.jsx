import axios from "axios";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function RegisterPage() {
    const navigate = useNavigate();

    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const validateForm = () => {
        if (!name.trim()) {
            return "Name is required";
        }

        if (name.trim().length < 3) {
            return "Name must be at least 3 characters";
        }

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

    const handleRegister = async () => {
        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            await axios.post(
                "http://localhost:8080/api/auth/register",
                {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    password: password.trim()
                }
            );

            alert("Registration successful");
            navigate("/login");

        } catch (error) {
            console.log(error);
            setError("Registration failed. Email may already exist.");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-[#111b21]">
            <div className="bg-[#202c33] p-10 rounded-2xl w-[400px] text-white shadow-2xl">
                <h1 className="text-3xl font-bold mb-8 text-center">
                    Register
                </h1>

                {error && (
                    <div className="mb-4 bg-red-500/20 text-red-300 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setError("");
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            emailRef.current?.focus();
                        }
                    }}
                    className="w-full mb-4 p-4 rounded-lg bg-[#2a3942] outline-none border border-transparent focus:border-green-500"
                />

                <input
                    ref={emailRef}
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            passwordRef.current?.focus();
                        }
                    }}
                    className="w-full mb-4 p-4 rounded-lg bg-[#2a3942] outline-none border border-transparent focus:border-green-500"
                />

                <input
                    ref={passwordRef}
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleRegister();
                        }
                    }}
                    className="w-full mb-6 p-4 rounded-lg bg-[#2a3942] outline-none border border-transparent focus:border-green-500"
                />

                <button
                    onClick={handleRegister}
                    className="w-full bg-green-500 hover:bg-green-600 p-4 rounded-lg font-semibold"
                >
                    Register
                </button>

                <p className="mt-5 text-center">
                    Already have account?

                    <Link
                        to="/login"
                        className="text-green-400 ml-2"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;