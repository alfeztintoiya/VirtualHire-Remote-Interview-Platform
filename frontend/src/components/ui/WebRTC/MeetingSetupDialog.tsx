import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-label";
import { useNavigate } from "react-router-dom";
import {v4 as uuidv4} from "uuid";

const MeetingSetupDialog: React.FC = () => {
  // State for toggling mic and camera
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  // Local stream state to control media tracks
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const navigate = useNavigate();
  const [meetingStart, setMeetingStart] = useState(false);


  useEffect(() => {
    const getLocalStream = async () => {
      try {
        // Request video and audio permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("Local stream obtained:", stream);
        setLocalStream(stream);
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    if(meetingStart)
      getLocalStream();

    // Cleanup: Stop all tracks when component unmounts
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [meetingStart]);

  // Toggle the camera by enabling/disabling video tracks
  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setCameraOn((prev) => !prev);
    }
  };

  // Toggle the mic by enabling/disabling audio tracks
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setMicOn((prev) => !prev);
    }
  };

  // When the user clicks "Join Meeting" redirect to Interview Room
  const handleJoinMeeting = () => {
    const newRoomId = uuidv4();
    navigate(`/interview/${newRoomId}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="w-full mt-7 bg-green-500 text-white hover:bg-green-600"
          onClick={()=>setMeetingStart(true)}
        >
          Start Call
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Meeting Setup</DialogTitle>
          <DialogDescription>
            Adjust your settings and preview your video before joining the meeting.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Video Preview Section */}
          <div className="flex justify-center">
            {localStream ? (
              <video
                autoPlay
                muted
                playsInline
                className="w-[400px] h-[300px] rounded-md border bg-black"
                ref={(video) => {
                  if (video && localStream) {
                    video.srcObject = localStream;
                  }
                }}
              />
            ) : (
              <p className="text-center text-gray-500">Loading camera...</p>
            )}
          </div>
          {/* Control Settings Section */}
          <div className="flex justify-around items-center">
            <div className="flex flex-col items-center">
              <Label className="text-sm mb-1">Camera</Label>
              <Button variant="outline" onClick={toggleCamera}>
                {cameraOn ? "On" : "Off"}
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <Label className="text-sm mb-1">Mic</Label>
              <Button variant="outline" onClick={toggleMic}>
                {micOn ? "On" : "Off"}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleJoinMeeting}
            variant="default"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Join Meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingSetupDialog;
