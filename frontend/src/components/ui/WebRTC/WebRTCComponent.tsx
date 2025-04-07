import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

// Ensure the URL points to your signaling server on port 8013
const SIGNALING_SERVER_URL = "http://localhost:8013";

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const WebRTCComponent: React.FC = () => {
  // Extract roomId from URL parameters
  const { roomId } = useParams<{ roomId: string }>();

  // Refs to store socket and local stream so they persist across renders
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    // Create and store socket connection only once
    const socketInstance = io(SIGNALING_SERVER_URL, {
      transports: ["websocket"],
    });
    socketRef.current = socketInstance;

    // Create RTCPeerConnection and store in ref
    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    // Join the room if roomId is provided
    if (roomId && socketInstance) {
      socketInstance.emit("join", roomId);
      console.log("Joined room:", roomId);
    }

    // Get local media stream once (and store in ref)
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          if (pc.signalingState !== "closed") {
            pc.addTrack(track, stream);
          }
        });
      })
      .catch((error) => console.error("Error accessing media devices:", error));

    // When a remote track is received, attach it to the remote video element
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // Handle ICE candidate events
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && roomId) {
        socketRef.current.emit("ice-candidate", { candidate: event.candidate, target: roomId });
      }
    };

    // Signaling event listeners
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

    // Auto-initiate call after a delay once local stream is set
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
      // Close the peer connection if not already closed
      if (peerConnectionRef.current && peerConnectionRef.current.signalingState !== "closed") {
        peerConnectionRef.current.close();
      }
      // Disconnect socket
      socketInstance.disconnect();
    };
  }, [roomId]);

  return (
    <div className="h-full">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain rounded-md bg-gray-100"
          />
    </div>
  );
};

export default WebRTCComponent;
