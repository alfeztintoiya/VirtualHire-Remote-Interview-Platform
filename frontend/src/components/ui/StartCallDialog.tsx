import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import CameraPreview from "../ui/WebRTC/CameraPreview";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const StartCallDialog: React.FC = () => {
  const [roomId, setRoomId] = useState<string>("");
  const navigate = useNavigate();

  const handleJoinMeeting = () => {
    
    const newRoomId = uuidv4();
    // Optionally, store newRoomId for later use
    setRoomId(newRoomId);
    // Navigate to Interview Room page with the room ID in the URL
    navigate(`/interview/${roomId}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full mt-7 text-white bg-green-500 hover:bg-green-600">
          Start Call
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>Start Call</DialogTitle>
          <DialogDescription>
            Preview your video and adjust settings before joining the meeting.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          {/* Local video preview */}
          <CameraPreview />
          {/* You can add more controls here if needed (e.g., mute/unmute, camera switch) */}
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

export default StartCallDialog;
