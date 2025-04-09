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
  
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const navigate = useNavigate();
  const [meetingStart, setMeetingStart] = useState(false);


  useEffect(() => {
    const getLocalStream = async () => {
      try {
        
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

    
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [meetingStart]);

  
  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setCameraOn((prev) => !prev);
    }
  };

  
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setMicOn((prev) => !prev);
    }
  };

  
  const handleJoinMeeting = () => {
    const newRoomId = uuidv4();
    navigate(`/interview/room?roomId=${newRoomId}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="w-full text-white bg-green-500 mt-7 hover:bg-green-600"
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
          
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center">
              <Label className="mb-1 text-sm">Camera</Label>
              <Button variant="outline" onClick={toggleCamera}>
                {cameraOn ? "On" : "Off"}
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <Label className="mb-1 text-sm">Mic</Label>
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
            className="text-white bg-green-500 hover:bg-green-600"
          >
            Join Meeting
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingSetupDialog;
