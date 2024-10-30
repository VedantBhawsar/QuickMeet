import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { IoCall } from "react-icons/io5";
import { BiCamera, BiCopy } from "react-icons/bi";
import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import PeerService from "../services/peer";
import { MdMic } from "react-icons/md";
import { useAuth } from "../contexts/AuthContext";

export default function MeetingPage() {
  const { meetingId } = useParams();
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [isAudio, setIsAudio] = useState(true);
  const [isVideo, setIsVideo] = useState(false);

  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Handle local media stream
  useEffect(() => {
    const getStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: isVideo,
          audio: isAudio,
        });
        setMyStream(stream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
        // Add tracks to peer connection if we have a remote peer
        if (remoteSocketId) {
          PeerService.addTrack(stream);
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast.error("Failed to access camera/microphone");
      }
    };

    getStream();

    return () => {
      if (myStream) {
        myStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideo, isAudio]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !user) return;

    // Handle when another user joins
    socket.on("user-joined", (data) => {
      console.log("User joined:", data);
      if (user.id !== data.id) {
        setRemoteSocketId(data.socketId);
        toast.success(`${data.name} joined the meeting`);
        handleCallUser(data.socketId); // Automatically call the new user
      }
    });

    // Handle incoming calls
    socket.on("incomming:call", async ({ from, offer }) => {
      console.log("Incoming call from:", from);
      setRemoteSocketId(from);
      const ans = await PeerService.getAnswer(offer);
      if (ans) socket.emit("call:accepted", { to: from, ans });

      if (myStream) {
        PeerService.addTrack(myStream);
      }
    });

    // Handle accepted calls
    socket.on("call:accepted", async ({ from, ans }) => {
      console.log("Call accepted by:", from);
      await PeerService.setRemoteDescription(ans);
      setRemoteStream(PeerService.getRemoteStream());
    });

    // Handle user leaving
    socket.on("user-left", (data) => {
      setRemoteSocketId(null);
      setRemoteStream(null);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      toast(`${data.email} left the meeting`);
    });

    // Join the meeting room
    socket.emit("join-meeting", {
      meetingId: meetingId,
      userId: user.id,
    });

    return () => {
      socket.off("user-joined");
      socket.off("incomming:call");
      socket.off("call:accepted");
      socket.off("user-left");
      PeerService.close();
    };
  }, [socket, user, meetingId, myStream]);

  // Update remote video when remote stream changes
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleCallUser = async (socketId: string) => {
    const offer = await PeerService.getOffer();
    if (offer) {
      socket.emit("user:call", { to: socketId, offer });
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const endMeet = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    PeerService.close();
    toast.success("Meeting ended");
    navigate("/");
  };

  return (
    <section className="h-full bg-gray-900 text-white">
      <div className="grid grid-cols-2 gap-6 p-10">
        <div className="flex justify-center items-center">
          <div className="bg-gray-800 h-64 w-[28rem] rounded-lg border-4 border-gray-700 shadow-lg">
            <video
              ref={myVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="bg-gray-800 h-64 w-[28rem] rounded-lg border-4 border-gray-700 shadow-lg">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-lg"
            />
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
          className={`flex items-center gap-3 group font-semibold ${
            isAudio ? "bg-white" : "bg-white/20"
          } hover:bg-white p-4 rounded-full transition duration-200`}
          onClick={() => setIsAudio((prev) => !prev)}
        >
          <MdMic
            className={`text-2xl ${
              isAudio
                ? "text-black group-hover:text-black"
                : "text-white group-hover:text-black"
            }`}
          />
        </button>
        <button
          className={`flex items-center gap-3 group font-semibold ${
            isVideo ? "bg-white" : "bg-white/20"
          } hover:bg-white p-4 rounded-full transition duration-200`}
          onClick={() => setIsVideo((prev) => !prev)}
        >
          <BiCamera
            className={`text-2xl ${
              isVideo
                ? "text-black group-hover:text-black"
                : "text-white group-hover:text-black"
            }`}
          />
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
