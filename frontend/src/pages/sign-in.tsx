export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full  text-white max-w-lg">
      <div className="w-full max-w-lg min-w-96 bg-gray-800 rounded-lg p-6  shadow-2xl">
        <h2 className="text-2xl font-semibold text-center mb-6 text-indigo-400">
          Login
        </h2>

        <form className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Sign In
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
