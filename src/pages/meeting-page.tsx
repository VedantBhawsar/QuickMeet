import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";
import { Button } from "../component/header";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";

const URL = "https://quickmeet-backend.onrender.com";

export const Room = ({
  name,
  localAudioTrack,
  localVideoTrack,
}: {
  name: string;
  localAudioTrack: MediaStreamTrack | null;
  localVideoTrack: MediaStreamTrack | null;
}) => {
  const [lobby, setLobby] = useState(true);
  const [socket, setSocket] = useState<null | Socket>(null);
  // eslint-disable-next-line no-unused-vars
  const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
    null
  );
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] =
    useState<MediaStream | null>(null);
  const remoteVideoRef = useRef<any>();
  const localVideoRef = useRef<any>();

  console.log(
    socket,
    remoteVideoRef,
    remoteVideoTrack,
    remoteAudioTrack,
    remoteMediaStream,
    sendingPc,
    receivingPc
  );

  useEffect(() => {
    const socket = io(URL);
    socket.on("send-offer", async ({ roomId }) => {
      console.log("sending offer");
      setLobby(false);
      const pc = new RTCPeerConnection();

      setSendingPc(pc);
      if (localVideoTrack) {
        console.error("added tack");
        console.log(localVideoTrack);
        pc.addTrack(localVideoTrack);
      }
      if (localAudioTrack) {
        console.error("added tack");
        console.log(localAudioTrack);
        pc.addTrack(localAudioTrack);
      }

      pc.onicecandidate = async (e) => {
        console.log("receiving ice candidate locally");
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "sender",
            roomId,
          });
        }
      };

      pc.onnegotiationneeded = async () => {
        console.log("on negotiation neeeded, sending offer");
        const sdp = await pc.createOffer();
        //@ts-ignore
        pc.setLocalDescription(sdp);
        socket.emit("offer", {
          sdp,
          roomId,
        });
      };
    });

    socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      console.log("received offer");
      setLobby(false);
      const pc = new RTCPeerConnection();
      pc.setRemoteDescription(remoteSdp);
      const sdp = await pc.createAnswer();
      //@ts-ignore
      pc.setLocalDescription(sdp);
      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }

      setRemoteMediaStream(stream);
      // trickle ice
      setReceivingPc(pc);
      // @ts-ignore
      window.pcr = pc;
      pc.ontrack = () => {
        alert("ontrack");
      };

      pc.onicecandidate = async (e) => {
        if (!e.candidate) {
          return;
        }
        console.log("omn ice candidate on receiving seide");
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId,
          });
        }
      };

      socket.emit("answer", {
        roomId,
        sdp: sdp,
      });
      setTimeout(() => {
        const track1 = pc.getTransceivers()[0].receiver.track;
        const track2 = pc.getTransceivers()[1].receiver.track;

        if (track1.kind === "video") {
          setRemoteAudioTrack(track2);
          setRemoteVideoTrack(track1);
        } else {
          setRemoteAudioTrack(track1);
          setRemoteVideoTrack(track2);
        }
        //@ts-ignore
        remoteVideoRef.current.srcObject.addTrack(track1);
        //@ts-ignore
        remoteVideoRef.current.srcObject.addTrack(track2);
        //@ts-ignore
        remoteVideoRef.current.play();
        // //@ts-ignore
      }, 5000);
    });

    socket.on("answer", (socketData) => {
      setLobby(false);
      setSendingPc((pc) => {
        pc?.setRemoteDescription(socketData.sdp);
        return pc;
      });
      console.log("loop closed");
    });

    socket.on("lobby", () => {
      setLobby(true);
    });

    socket.on("add-ice-candidate", ({ candidate, type }) => {
      console.log("add ice candidate from remote");
      console.log({ candidate, type });
      if (type == "sender") {
        setReceivingPc((pc) => {
          if (!pc) {
            console.error("receicng pc nout found");
          } else {
            console.error(pc.ontrack);
          }
          pc?.addIceCandidate(candidate);
          return pc;
        });
      } else {
        setSendingPc((pc) => {
          if (!pc) {
            console.error("sending pc nout found");
          } else {
            // console.error(pc.ontrack)
          }
          pc?.addIceCandidate(candidate);
          return pc;
        });
      }
    });

    setSocket(socket);

    return () => {
      console.log("Cleaning up...");

      // Close the socket connection
      if (socket) {
        socket.disconnect();
      }

      // Clean up the sending PeerConnection
      if (sendingPc) {
        sendingPc.close();
        setSendingPc(null);
      }

      // Clean up the receiving PeerConnection
      if (receivingPc) {
        receivingPc.close();
        setReceivingPc(null);
      }

      // Clean up remote media stream
      if (remoteMediaStream) {
        remoteMediaStream.getTracks().forEach((track) => track.stop());
        setRemoteMediaStream(null);
      }

      // Clear the remote video element
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    };
  }, [name]);

  useEffect(() => {
    if (localVideoRef.current) {
      if (localVideoTrack) {
        localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
        localVideoRef.current.play();
      }
    }
  }, [localVideoRef]);

  function handleCopy() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Meeting ID copied to clipboard");
  }

  return (
    <div className="flex flex-col justify-center w-full px-2">
      <div className="mx-auto w-full  md:w-1/2 mb-5 rounded-xl p-5 bg-white/10 flex justify-center items-center">
        <h1 className="font-bold text-xl">Meeting ID: {name}</h1>
        <span
          className="text-sm mb-2 ml-1 cursor-pointer group"
          onClick={handleCopy}
        >
          <Copy
            size={14}
            className="group-active:text-slate-300 cursor-pointer"
          />
        </span>
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 bg-white/10 p-1 rounded-lg overflow-hidden aspect-video object-cover">
          <video
            autoPlay
            className="object-cover aspect-video rounded-lg"
            ref={localVideoRef}
          />
        </div>
        <div className="flex-1 bg-white/10 p-1 rounded-lg overflow-hidden aspect-video object-cover ">
          {lobby ? (
            <p className="flex ">Waiting to connect you to someone</p>
          ) : null}
          <video
            autoPlay
            className="object-cover aspect-video  rounded-lg"
            ref={remoteVideoRef}
          />
        </div>
      </div>
    </div>
  );
};

export default function Landing() {
  const { meetingId } = useParams() as {
    meetingId: string;
  };
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setlocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [joined, setJoined] = useState(false);

  const getCam = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    // MediaStream
    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];
    setLocalAudioTrack(audioTrack);
    setlocalVideoTrack(videoTrack);
    if (!videoRef.current) {
      return;
    }
    videoRef.current.srcObject = new MediaStream([videoTrack]);
    await videoRef.current.play();
    // MediaStream
  };

  useEffect(() => {
    if (videoRef && videoRef.current) {
      getCam();
    }
  }, [videoRef]);

  if (!joined) {
    return (
      <div className="flex justify-center items-center flex-col ">
        <div className="bg-white/10 p-3 rounded-xl shadow-lg flex items-center justify-center">
          {videoRef === null ? (
            <p className="">camera not found</p>
          ) : (
            <video
              autoPlay
              ref={videoRef}
              className="aspect-video object-cover rounded-xl"
            ></video>
          )}
        </div>
        <Button
          variant="primary"
          className="mt-5"
          onClick={() => {
            setJoined(true);
          }}
        >
          Join
        </Button>
      </div>
    );
  }

  return (
    <Room
      name={meetingId}
      localAudioTrack={localAudioTrack}
      localVideoTrack={localVideoTrack}
    />
  );
}
