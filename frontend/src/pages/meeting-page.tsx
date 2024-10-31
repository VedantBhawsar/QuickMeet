import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { IoCall } from "react-icons/io5";
import { BiCamera, BiCopy } from "react-icons/bi";
import React, { useEffect, useState, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import PeerService from "../services/peer";
import { MdMic } from "react-icons/md";
import { useAuth } from "../contexts/AuthContext";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function MeetingPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [isAudio, setIsAudio] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);

  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const setupMediaStream = async () => {
    try {
      // Stop existing tracks
      if (myStream) {
        myStream.getTracks().forEach((track) => track.stop());
      }

      // Only request media if either audio or video is enabled
      if (isAudio || isVideo) {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: isVideo,
          audio: isAudio,
        });

        setMyStream(newStream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = newStream;
        }

        // If we're already connected to a peer, update the stream
        if (remoteSocketId) {
          PeerService.addStream(newStream);
          if (isInitiator) {
            initiateCall(remoteSocketId);
          }
        }
      } else {
        setMyStream(null);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = null;
        }
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast.error("Failed to access camera/microphone");
    }
  };

  const initiateCall = async (socketId: string) => {
    try {
      if (myStream) {
        PeerService.addStream(myStream);
      }
      const offer = await PeerService.createOffer();
      socket.emit("user:call", { to: socketId, offer });
    } catch (error) {
      console.error("Error initiating call:", error);
    }
  };

  useEffect(() => {
    setupMediaStream();
    return () => {
      if (myStream) {
        myStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isVideo, isAudio]);

  useEffect(() => {
    if (!socket || !user || !meetingId) return;

    // Subscribe to remote peer tracks
    PeerService.subscribeToTrack((stream) => {
      console.log("Received remote stream");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    });

    // Handle when another user joins
    socket.on(
      "user-joined",
      async (data: { id: string; socketId: string; name: string }) => {
        if (user.id !== data.id) {
          setRemoteSocketId(data.socketId);
          setIsInitiator(true);
          toast.success(`${data.name} joined the meeting`);
          // Automatically initiate the call
          await initiateCall(data.socketId);
        }
      }
    );

    // Handle incoming call
    socket.on("incomming:call", async ({ from, offer }) => {
      try {
        console.log("Received call from:", from);
        setRemoteSocketId(from);
        setIsInitiator(false);

        // Add local stream if available
        if (myStream) {
          PeerService.addStream(myStream);
        }

        const answer = await PeerService.handleOffer(offer);
        socket.emit("call:accepted", { to: from, ans: answer });
      } catch (error) {
        console.error("Error handling incoming call:", error);
      }
    });

    // Handle call accepted
    socket.on("call:accepted", async ({ from, ans }) => {
      try {
        console.log("Call accepted by:", from);
        await PeerService.setRemoteAnswer(ans);
      } catch (error) {
        console.error("Error handling accepted call:", error);
      }
    });

    // Handle user leaving
    socket.on("user-left", (data: { email: string }) => {
      setRemoteSocketId(null);
      setIsInitiator(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      toast(`${data.email} left the meeting`);
    });

    // Join the meeting room
    socket.emit("join-meeting", {
      meetingId,
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
            {isVideo ? (
              <video
                ref={myVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Camera Off</p>
              </div>
            )}
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
            {!remoteSocketId && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-400">Waiting for others to join...</p>
              </div>
            )}
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
