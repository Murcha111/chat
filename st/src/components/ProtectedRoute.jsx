import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserProvider";

const ProtectedRoute = ({ children }) => {
  const { isAuth } = useUser();

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
