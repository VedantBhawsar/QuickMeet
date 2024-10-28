import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { IoCall } from "react-icons/io5";
import { BiCopy } from "react-icons/bi";
export default function MeetingPage() {
  const { meetingId } = useParams();

  async function copyUrl() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success("Link copied to clipboard!"))
      .catch(() => toast.error("Failed to copy"));
  }
  const navigate = useNavigate();

  async function endMeet() {
    toast.success("Meeting ended");
    navigate("/");
  }

  return (
    <section className="h-full bg-gray-900 text-white">
      <div className="grid grid-cols-2 gap-6 p-10">
        <div className="flex justify-center items-center">
          <div className="bg-gray-800 h-64 w-[28rem] rounded-lg border-4 border-gray-700 shadow-lg">
            <video src=""></video>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="bg-gray-800 h-64 w-[28rem] rounded-lg border-4 border-gray-700 shadow-lg">
            <video src=""></video>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          className="flex items-center gap-3 font-semibold bg-red-600 hover:bg-red-700 p-4 rounded-full transition duration-200"
          onClick={endMeet}
        >
          <IoCall className="text-2xl" />
          End Call
        </button>
        <button
          className="bg-blue-600 font-semibold hover:bg-blue-700 p-4 rounded-full flex items-center gap-3 transition duration-200"
          onClick={copyUrl}
        >
          <BiCopy className="text-2xl" />
          Copy Link
        </button>
      </div>
    </section>
  );
}
