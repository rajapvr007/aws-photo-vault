import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../api/authApi";
const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);

  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );

  const [idToken, setIdToken] = useState(
    localStorage.getItem("idToken") || null
  );

  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken") || null
  );

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    } else {
      localStorage.removeItem("accessToken");
    }

    if (idToken) {
      localStorage.setItem("idToken", idToken);
    } else {
      localStorage.removeItem("idToken");
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      localStorage.removeItem("refreshToken");
    }
    
  }, [accessToken, idToken, refreshToken,]);
  
 useEffect(() => {
  const restoreSession = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await getMe(accessToken);

      setUser(response.data.user);

    } catch (error) {
      console.error("Session Restore Failed:", error);

      logout();

    } finally {
      setLoading(false);
    }
  };

  restoreSession();
}, [accessToken]);

  const login = (tokens) => {
    setAccessToken(tokens.accessToken);
    setIdToken(tokens.idToken);
    setRefreshToken(tokens.refreshToken);
  };

 const logout = () => {
  setUser(null);
  setAccessToken(null);
  setIdToken(null);
  setRefreshToken(null);

  localStorage.removeItem("accessToken");
  localStorage.removeItem("idToken");
  localStorage.removeItem("refreshToken");
};

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,

        accessToken,
        idToken,
        refreshToken,

        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);