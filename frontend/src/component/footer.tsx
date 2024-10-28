import { BsGithub, BsTwitter } from "react-icons/bs";

export default function Footer() {
  return (
    <footer className="border-t border-gray-700 bg-gray-800 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h6 className="text-sm text-gray-400 font-semibold">
          © 2024 Video Chat Application
        </h6>
        <div className="flex gap-4">
          <a
            href="https://github.com/vedantbhawsar"
            target="_blank"
            rel="noopener noreferrer"
          >
            <BsGithub className="text-xl text-gray-400 hover:text-white transition-colors duration-150" />
          </a>
          <a
            href="https://twitter.com/vedantbhavsar8"
            target="_blank"
            rel="noopener noreferrer"
          >
            <BsTwitter className="text-xl text-gray-400 hover:text-white transition-colors duration-150" />
          </a>
        </div>
      </div>
    </footer>
  );
}
