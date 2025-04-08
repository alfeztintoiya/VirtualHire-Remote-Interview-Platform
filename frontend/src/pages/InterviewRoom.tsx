import React ,{useState} from "react";
import { useParams , useNavigate} from "react-router-dom";
import WebRTCComponent from "@/components/ui/WebRTC/WebRTCComponent";
import CameraPreview from "@/components/ui/WebRTC/CameraPreview";
import CodeEditor from "@/components/ui/CodeEditor";
import { MicOff, Mic, Video, VideoOff, Phone } from "lucide-react";

const InterviewRoom: React.FC = () => {

  const [cameraOn , setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  

  const handleEndCall = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-white pb-0">
      {/* Header */}

      <div className="flex flex-row gap-4 h-[85vh] px-4 pt-4">
        {/* Left side: Video Calls */}
        <div className="flex flex-col gap-4 w-1/2 h-full">
          {/* Recruiter */}
          <div className="flex-1 border rounded-lg bg-white shadow-sm overflow-hidden">
            <div className="p-4 h-[calc(100%-48px)] flex items-center justify-center">
              <WebRTCComponent />
            </div>
            <h2 className="text-lg font-semibold p-3 border-b">Recruiter</h2>
          </div>

          {/* Candidate */}
          <div className="flex-1 border rounded-lg bg-white shadow-sm overflow-hidden">
            <div className="p-4 h-[calc(100%-48px)] flex items-center justify-center">
              <CameraPreview cameraOn={cameraOn} micOn={micOn}/>
            </div>
            <h2 className="text-lg font-semibold p-3 border-b">Candidate</h2>
          </div>
        </div>

        {/* Right side: Code Editor */}
        <div className="w-4/5 h-full border rounded-lg bg-white shadow-sm overflow-hidden p-4">
          <h2 className="text-lg font-semibold mb-2">Code Editor</h2>
          <div className="h-full bg-gray-100 rounded-md p-4">
            <CodeEditor/>
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center gap-3 p-2 border-t  border-gray-300 bg-white">
        <button
          onClick={() => setMicOn((prev) => !prev)}
          className={`p-3 rounded-full ${micOn ? "bg-green-500" : "bg-red-500"}`}
        >
          {micOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
        </button>
        <button
          onClick={() => setCameraOn((prev) => !prev)}
          className={`p-3 rounded-full ${cameraOn ? "bg-green-500" : "bg-red-500"}`}
        >
          {cameraOn ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
        </button>
        
        <button className="p-3 rounded-full bg-red-600">
          <Phone className="w-6 h-6 text-white" onClick={handleEndCall}/>
        </button>
      </div>
    </div>
  );
};

export default InterviewRoom;