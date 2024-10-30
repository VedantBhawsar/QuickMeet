import { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Header() {
  const { user, setUser } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <nav className="border-b border-gray-700 bg-gray-800 shadow-lg">
      <div className="h-16 mx-auto max-w-6xl px-6 flex justify-between items-center">
        <Link
          to="/"
          className="font-bold text-xl text-indigo-500 hover:underline transition-colors"
        >
          QuickMeet
        </Link>
        <ul className="flex gap-4 items-center">
          {user ? (
            <>
              <li>
                <Avatar
                  src="https://media.istockphoto.com/id/1310710228/photo/american-football-ball-and-helmet-on-the-grass-of-football-arena-or-stadium.jpg?b=1&s=170667a&w=0&k=20&c=-Q2dKXNxJsnLofKpctOehJvel-lgC3gmkOWb0vJJ2bg="
                  name={user.name}
                />
              </li>

              <li>
                <Button onClick={handleLogout}>Logout</Button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/sign-in">
                  <Button variant="secondary">Sign in</Button>
                </Link>
              </li>

              <li>
                <Link to="/sign-up">
                  <Button>Sign up</Button>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export function Avatar({ src, name }: { src: string; name: string }) {
  return (
    <div className="flex gap-2 items-center">
      <img className="w-10 h-10 object-cover rounded-full" src={src} />
      <p className="font-bold">{name}</p>
    </div>
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export function Button({
  children,
  variant = "primary",
  ...props
}: ButtonProps) {
  const css =
    variant === "primary"
      ? "bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-150 shadow-md"
      : "border border-indigo-500 text-indigo-400 hover:bg-white/5 hover:bg-gray-800 px-4 py-2 rounded-lg font-semibold transition-colors duration-150 shadow-md ";

  return (
    <button className={css} {...props}>
      {children}
    </button>
  );
}
