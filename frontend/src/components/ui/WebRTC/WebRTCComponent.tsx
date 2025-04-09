import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

// Ensure the URL points to your signaling server on port 8013
const SIGNALING_SERVER_URL = "http://localhost:8013";

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const WebRTCComponent: React.FC = () => {
  
  const { roomId } = useParams<{ roomId: string }>();

  
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    
    const socketInstance = io(SIGNALING_SERVER_URL, {
      transports: ["websocket"],
    });
    socketRef.current = socketInstance;

    
    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    
    if (roomId && socketInstance) {
      socketInstance.emit("join", roomId);
      console.log("Joined room:", roomId);
    }

    
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        //add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          if (pc.signalingState !== "closed") {
            pc.addTrack(track, stream);
          }
        });
      })
      .catch((error) => console.error("Error accessing media devices:", error));

    
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && roomId) {
        socketRef.current.emit("ice-candidate", { candidate: event.candidate, target: roomId });
      }
    };

    
    socketInstance.on("offer", async (data: any) => {
      console.log("Received offer:", data);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketInstance.emit("answer", { sdp: answer, target: data.caller });
    });

    socketInstance.on("answer", async (data: any) => {
      console.log("Received answer:", data);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
    });

    socketInstance.on("ice-candidate", async (data: any) => {
      console.log("Received ICE candidate:", data);
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    });

    
    const timer = setTimeout(() => {
      if (localStreamRef.current && pc && pc.signalingState === "stable" && roomId && socketRef.current) {
        pc.createOffer()
          .then((offer) => {
            return pc.setLocalDescription(offer).then(() => offer);
          })
          .then((offer) => {
            socketRef.current?.emit("offer", { sdp: offer, target: roomId });
            console.log("Offer sent:", offer);
          })
          .catch((error) => {
            console.error("Error initiating call:", error);
          });
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      
      if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== "closed") {
        peerConnectionRef.current.close();
      }
      
      socketInstance.disconnect();
    };
  }, [roomId]);

  return (
    <div className="h-full">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="object-contain w-full h-full bg-gray-100 rounded-md"
          />
    </div>
  );
};

export default WebRTCComponent;
