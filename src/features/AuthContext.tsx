import { createContext, useEffect, useState } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useHook } from "@/hooks";

export const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { setLoggedInUser, setUserName, setUserEmail } = useHook();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedInUser(true);
        setUserName(user.displayName);
        setUserEmail(user.email);
        setLoading(false);
      } else {
        setLoggedInUser(false);
        setUserName("");
        setUserEmail("");
      }
      setLoading(false);
    });

    return () => {
      unsub();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ loading }}>{children}</AuthContext.Provider>
  );
};
