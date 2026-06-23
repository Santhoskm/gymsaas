// src/components/auth/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";  // ← use the hook

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();  // ← get login from context
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = "Username is required";
        if (!formData.password) newErrors.password = "Password is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const result = await login(formData.username, formData.password);
            if (result.success) {
                toast.success("Login successful!");
                navigate("/dashboard", { replace: true });
            } else {
                toast.error(result.error || "Invalid username or password");
            }
        } catch {
            toast.error("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-red/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-orange/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-red/10 to-brand-orange/10 rounded-2xl blur-xl" />

                <div className="relative bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-8 animate-fade-in">
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center">
                                <Zap size={20} className="text-white fill-white" />
                            </div>
                            <div>
                                <span className="font-display text-2xl font-black text-brand-text tracking-tight">GYM</span>
                                <span className="font-display text-2xl font-black text-brand-red tracking-tight">FLOW</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="font-display text-2xl font-bold text-brand-text">Welcome Back</h1>
                        <p className="text-brand-subtle text-sm mt-2">Sign in to manage your gym</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-medium text-brand-subtle uppercase tracking-wider mb-1.5">
                                Username / ID
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-subtle" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter your username"
                                    className={`w-full bg-brand-card border rounded-lg pl-10 pr-4 py-2.5 text-brand-text text-sm placeholder-brand-subtle focus:outline-none focus:border-brand-red transition-colors ${errors.username ? "border-red-500" : "border-brand-border"}`}
                                    autoComplete="username"
                                />
                            </div>
                            {errors.username && (
                                <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
                                    <AlertCircle size={12} /> {errors.username}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-brand-subtle uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-subtle" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full bg-brand-card border rounded-lg pl-10 pr-12 py-2.5 text-brand-text text-sm placeholder-brand-subtle focus:outline-none focus:border-brand-red transition-colors ${errors.password ? "border-red-500" : "border-brand-border"}`}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-subtle hover:text-brand-text transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
                                    <AlertCircle size={12} /> {errors.password}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-red hover:bg-red-700 text-white font-body font-semibold text-sm py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-xs text-brand-subtle mt-6">
                        &copy; {new Date().getFullYear()} GymFlow. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}