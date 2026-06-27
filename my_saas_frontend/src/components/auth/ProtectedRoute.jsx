// import { Navigate } from "react-router-dom";
// import { useAuth } from "../../hooks/useAuth";

// export default function ProtectedRoute({ children }) {
//     const { isAuthenticated, loading } = useAuth();

//     console.log("ProtectedRoute - isAuthenticated:", isAuthenticated, "loading:", loading);

//     if (loading) {
//         return (
//             <div className="min-h-screen bg-brand-dark flex items-center justify-center">
//                 <div className="w-8 h-8 border-3 border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
//             </div>
//         );
//     }

//     if (!isAuthenticated) {
//         console.log("Not authenticated, redirecting to login");
//         return <Navigate to="/login" replace />;
//     }

//     console.log("Authenticated, rendering children");
//     return children;
// }


import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-dark flex items-center justify-center">
                <div className="w-8 h-8 border-[3px] border-brand-red/30 border-t-brand-red rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}