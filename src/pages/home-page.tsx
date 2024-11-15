import toast from "react-hot-toast";
import { Button } from "../component/header";
import axiosApi from "../services/apiServices";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  async function joinMeet() {
    const meetingId = await prompt("Enter Meeting id");
    console.log(meetingId);
  }

  async function createMeet() {
    try {
      const { data } = await axiosApi.post("/start-meeting", {
        title: "test",
        description: "this is test data",
      });
      console.log(data);
      toast.success("meet created successfully");
      navigate("/m/" + data.accessCode);
    } catch (error: any) {
      alert(JSON.stringify(error));
      console.log(error);
    }
  }

  return (
    <section className="flex justify-center items-center min-h-full">
      <div className="bg-gray-800 p-12 rounded-xl shadow-xl backdrop-blur-md border border-gray-700 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center text-indigo-400 mb-6">
          Welcome to QuickMeet
        </h1>

        <p className="text-center text-gray-400 mb-8">
          Join an existing meeting or create a new one.
        </p>
        <div className="grid grid-cols-1 gap-6">
          <Button
            onClick={joinMeet}
            className="p-4 w-full bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-300 transform "
          >
            Join Meet
          </Button>
          <hr className="border-gray-600" />
          <Button
            onClick={createMeet}
            className="p-4 w-full bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-600 transition-colors duration-300 transform "
          >
            Create Meet
          </Button>
        </div>
      </div>
    </section>
  );
}
