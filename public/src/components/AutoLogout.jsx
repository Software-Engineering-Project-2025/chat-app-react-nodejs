import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AutoLogout({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.clear();
      navigate("/login", { replace: true });
    }, 20 * 60 * 1000); // 20 minutes

    return () => clearTimeout(timer);
  }, [navigate]);

  return <>{children}</>;
}
