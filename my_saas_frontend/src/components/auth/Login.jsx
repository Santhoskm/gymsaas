// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Zap, User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
// import toast from "react-hot-toast";

// export default function Login() {
//     const navigate = useNavigate();
//     const [showPassword, setShowPassword] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [formData, setFormData] = useState({
//         username: "",
//         password: "",
//     });
//     const [errors, setErrors] = useState({});

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//         if (errors[name]) {
//             setErrors((prev) => ({ ...prev, [name]: "" }));
//         }
//     };

//     const validate = () => {
//         const newErrors = {};
//         if (!formData.username.trim()) {
//             newErrors.username = "Username is required";
//         }
//         if (!formData.password) {
//             newErrors.password = "Password is required";
//         }
//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validate()) return;

//         setLoading(true);
//         try {
//             const response = await fetch("http://192.168.1.11:8000/api/login/", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     username: formData.username,
//                     password: formData.password,
//                 }),
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 // FIX: Use the correct field names from your backend
//                 if (data.access) {
//                     localStorage.setItem("authToken", data.access);
//                 }
//                 if (data.refresh) {
//                     localStorage.setItem("refreshToken", data.refresh);
//                 }
//                 if (data.user) {
//                     localStorage.setItem("user", JSON.stringify(data.user));
//                 }
//                 localStorage.setItem("username", formData.username);

//                 toast.success(data.message || "Login successful!");

//                 setTimeout(() => {
//                     navigate("/dashboard", { replace: true });
//                 }, 100);
//             } else {
//                 // Handle error response based on your backend structure
//                 if (data.message) {
//                     toast.error(data.message);
//                 } else if (data.errors) {
//                     // Extract first error message from errors object
//                     const firstError = Object.values(data.errors)[0];
//                     toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
//                 } else {
//                     toast.error("Invalid username or password");
//                 }
//             }
//         } catch (error) {
//             console.error("Login error:", error);
//             toast.error("Network error. Please check your connection.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
//             {/* Animated background gradient */}
//             <div className="absolute inset-0 overflow-hidden">
//                 <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-red/20 rounded-full blur-3xl animate-pulse" />
//                 <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-orange/20 rounded-full blur-3xl animate-pulse delay-1000" />
//             </div>

//             {/* Login Card */}
//             <div className="relative w-full max-w-md">
//                 <div className="absolute inset-0 bg-gradient-to-r from-brand-red/10 to-brand-orange/10 rounded-2xl blur-xl" />

//                 <div className="relative bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-8 animate-fade-in">
//                     {/* Logo */}
//                     <div className="flex justify-center mb-8">
//                         <div className="flex items-center gap-2.5">
//                             <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center">
//                                 <Zap size={20} className="text-white fill-white" />
//                             </div>
//                             <div>
//                                 <span className="font-display text-2xl font-black text-brand-text tracking-tight">GYM</span>
//                                 <span className="font-display text-2xl font-black text-brand-red tracking-tight">FLOW</span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Title */}
//                     <div className="text-center mb-8">
//                         <h1 className="font-display text-2xl font-bold text-brand-text">Welcome Back</h1>
//                         <p className="text-brand-subtle text-sm mt-2">Sign in to manage your gym</p>
//                     </div>

//                     {/* Form */}
//                     <form onSubmit={handleSubmit} className="space-y-5">
//                         {/* Username Field */}
//                         <div>
//                             <label className="block text-xs font-medium text-brand-subtle uppercase tracking-wider mb-1.5">
//                                 Username / ID
//                             </label>
//                             <div className="relative">
//                                 <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-subtle" />
//                                 <input
//                                     type="text"
//                                     name="username"
//                                     value={formData.username}
//                                     onChange={handleChange}
//                                     placeholder="Enter your username"
//                                     className={`w-full bg-brand-card border rounded-lg pl-10 pr-4 py-2.5 text-brand-text text-sm placeholder-brand-subtle focus:outline-none focus:border-brand-red transition-colors ${errors.username ? "border-red-500" : "border-brand-border"
//                                         }`}
//                                     autoComplete="username"
//                                 />
//                             </div>
//                             {errors.username && (
//                                 <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
//                                     <AlertCircle size={12} /> {errors.username}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Password Field */}
//                         <div>
//                             <label className="block text-xs font-medium text-brand-subtle uppercase tracking-wider mb-1.5">
//                                 Password
//                             </label>
//                             <div className="relative">
//                                 <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-subtle" />
//                                 <input
//                                     type={showPassword ? "text" : "password"}
//                                     name="password"
//                                     value={formData.password}
//                                     onChange={handleChange}
//                                     placeholder="••••••••"
//                                     className={`w-full bg-brand-card border rounded-lg pl-10 pr-12 py-2.5 text-brand-text text-sm placeholder-brand-subtle focus:outline-none focus:border-brand-red transition-colors ${errors.password ? "border-red-500" : "border-brand-border"
//                                         }`}
//                                     autoComplete="current-password"
//                                 />
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowPassword(!showPassword)}
//                                     className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-subtle hover:text-brand-text transition-colors"
//                                 >
//                                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                                 </button>
//                             </div>
//                             {errors.password && (
//                                 <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
//                                     <AlertCircle size={12} /> {errors.password}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Submit Button */}
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full bg-brand-red hover:bg-red-700 text-white font-body font-semibold text-sm py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
//                         >
//                             {loading ? (
//                                 <>
//                                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                                     Signing in...
//                                 </>
//                             ) : (
//                                 "Sign In"
//                             )}
//                         </button>
//                     </form>

//                     {/* Footer */}
//                     <p className="text-center text-xs text-brand-subtle mt-6">
//                         &copy; {new Date().getFullYear()} GymFlow. All rights reserved.
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// }

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.username.trim()) {
            newErrors.username = "Username is required";
        }
        if (!formData.password) {
            newErrors.password = "Password is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            console.log("Sending login request for:", formData.username);
            const response = await fetch("http://192.168.1.11:8000/api/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                }),
            });

            const data = await response.json();
            console.log("Login response status:", response.status);
            console.log("Login response data:", data);

            if (response.ok) {
                console.log("Login successful, checking data fields...");

                // Check what data we received
                console.log("Has access token?", !!data.access);
                console.log("Has refresh token?", !!data.refresh);
                console.log("Has user?", !!data.user);
                console.log("Has username?", !!data.username);

                // Store the token (try both possible field names)
                if (data.access) {
                    localStorage.setItem("authToken", data.access);
                    console.log("Access token stored");
                } else if (data.token) {
                    localStorage.setItem("authToken", data.token);
                    console.log("Token stored (from token field)");
                } else {
                    console.warn("No token found in response!");
                }

                if (data.refresh) {
                    localStorage.setItem("refreshToken", data.refresh);
                }

                // Store user data (try different possible structures)
                if (data.user) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                    console.log("User data stored:", data.user);
                } else if (data.username) {
                    localStorage.setItem("user", JSON.stringify({ username: data.username }));
                    console.log("Username stored");
                } else {
                    // Create a basic user object
                    localStorage.setItem("user", JSON.stringify({ username: formData.username }));
                    console.log("Created basic user object");
                }

                localStorage.setItem("username", formData.username);

                // Verify storage
                console.log("Stored authToken:", !!localStorage.getItem("authToken"));
                console.log("Stored user:", !!localStorage.getItem("user"));

                toast.success(data.message || "Login successful!");

                // Use window.location as fallback if navigate doesn't work
                setTimeout(() => {
                    console.log("Attempting to navigate to dashboard...");
                    navigate("/dashboard", { replace: true });
                    // Fallback: if navigate doesn't work after 500ms, use window.location
                    setTimeout(() => {
                        if (window.location.pathname !== "/dashboard") {
                            console.log("Navigate didn't work, using window.location");
                            window.location.href = "/dashboard";
                        }
                    }, 500);
                }, 100);
            } else {
                console.error("Login failed:", data);
                // Handle error response
                if (data.message) {
                    toast.error(data.message);
                } else if (data.errors) {
                    const firstError = Object.values(data.errors)[0];
                    toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
                } else if (data.detail) {
                    toast.error(data.detail);
                } else {
                    toast.error("Invalid username or password");
                }
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
            {/* Animated background gradient */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-red/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-orange/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-red/10 to-brand-orange/10 rounded-2xl blur-xl" />

                <div className="relative bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-8 animate-fade-in">
                    {/* Logo */}
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

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="font-display text-2xl font-bold text-brand-text">Welcome Back</h1>
                        <p className="text-brand-subtle text-sm mt-2">Sign in to manage your gym</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Field */}
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
                                    className={`w-full bg-brand-card border rounded-lg pl-10 pr-4 py-2.5 text-brand-text text-sm placeholder-brand-subtle focus:outline-none focus:border-brand-red transition-colors ${errors.username ? "border-red-500" : "border-brand-border"
                                        }`}
                                    autoComplete="username"
                                />
                            </div>
                            {errors.username && (
                                <p className="flex items-center gap-1 text-xs text-red-400 mt-1">
                                    <AlertCircle size={12} /> {errors.username}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
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
                                    className={`w-full bg-brand-card border rounded-lg pl-10 pr-12 py-2.5 text-brand-text text-sm placeholder-brand-subtle focus:outline-none focus:border-brand-red transition-colors ${errors.password ? "border-red-500" : "border-brand-border"
                                        }`}
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

                        {/* Submit Button */}
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
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-xs text-brand-subtle mt-6">
                        &copy; {new Date().getFullYear()} GymFlow. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}