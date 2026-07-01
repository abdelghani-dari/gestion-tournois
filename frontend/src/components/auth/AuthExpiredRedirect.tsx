import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

export const AUTH_EXPIRED_EVENT = "auth:expired";

export default function AuthExpiredRedirect() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleExpired = () => {
      void logout().finally(() => {
        navigate("/login", { replace: true, state: { reason: "session-expired" } });
      });
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, [logout, navigate]);

  return null;
}
