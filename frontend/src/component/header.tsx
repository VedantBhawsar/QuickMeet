import { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

export default function Header() {
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
          <li>
            <Link to="/sign-in">
              <Button variant="secondary">Sign in</Button>
            </Link>
          </li>
          <li>
            <Link to="/">
              <Button>Logout</Button>
            </Link>
          </li>
          <li>
            <Link to="/sign-up">
              <Button>Sign up</Button>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
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
