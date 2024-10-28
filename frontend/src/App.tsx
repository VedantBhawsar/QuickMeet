import ErrorPage from "./component/error-page";
import Footer from "./component/footer";
import Header from "./component/header";
import HomePage from "./pages/home-page";
import MeetingPage from "./pages/meeting-page";
import SignInPage from "./pages/sign-in";
import SignUpPage from "./pages/sign-up";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-gray-900 text-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow max-w-6xl  mx-auto flex items-center py-8 px-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/m/:meetingId" element={<MeetingPage />} />
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
