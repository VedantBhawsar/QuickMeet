import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../services/apiServices";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<{} | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  const value = useMemo(() => ({ user, setUser }), [user, setUser]);

  const checkToken = useCallback(async () => {
    let token = localStorage.getItem("token");
    if (!token) {
      navigate("/sign-in");
      return;
    }
    try {
      const { data } = await axiosApi.get("/user");
      setUser(data);
    } catch (error: any) {
      console.log(error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/sign-in");
      }
    }
  }, [navigate, user]);

  useEffect(() => {
    if (!user) {
      checkToken();
    }
  }, [user]);

  return (
    <AuthContext.Provider
      // @ts-ignore
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};
