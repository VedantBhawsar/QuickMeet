import toast from "react-hot-toast";
import axiosApi from "../services/apiServices";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  console.log(user);
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const payload = {
      name,
      email,
      password,
    };

    try {
      const {
        data,
      }: {
        data: { token: string };
      } = await toast.promise(
        new Promise((resolve) => resolve(axiosApi.post("/signup", payload))),
        {
          loading: "loading...",
          success: "User created successfully",
          error: "Error creating user",
        }
      );
      setUser(data);
      localStorage.setItem("token", data.token);
    } catch (error: any) {
      console.log(error);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-4">
      <div className="w-full max-w-md min-w-96 bg-gray-800 rounded-lg p-6 shadow-xl ">
        <h2 className="text-2xl font-semibold text-center mb-6 text-indigo-400">
          Create Account
        </h2>

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            required
            name={"name"}
            className="p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            required
            name="email"
            type="email"
            placeholder="Email"
            className="p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            name="password"
            required
            type="password"
            placeholder="Password"
            className="p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Sign Up
          </button>
        </form>

        <div className="flex items-center justify-between my-4">
          <hr className="w-1/3 border-gray-600" />
          <span className="text-gray-400">OR</span>
          <hr className="w-1/3 border-gray-600" />
        </div>

        <button className="flex items-center justify-center p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 w-full mb-4">
          Sign in with Google
        </button>

        <button className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200 w-full">
          Continue as Guest
        </button>
      </div>
    </div>
  );
}
