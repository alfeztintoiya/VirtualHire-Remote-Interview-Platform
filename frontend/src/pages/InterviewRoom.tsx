import React ,{useState} from "react";
import { useParams , useNavigate , useLocation} from "react-router-dom";
import WebRTCComponent from "../components/ui/WebRTC/WebRTCComponent";
import CameraPreview from "../components/ui/WebRTC/CameraPreview";
import CodeEditor from "../components/ui/CodeEditor";
import { MicOff, Mic, Video, VideoOff, Phone } from "lucide-react";
import useSubtitles from "../hooks/useSubtitles";
import axios from "axios";
import {BASE_URL}  from "../constants/index";

const InterviewRoom: React.FC = () => {

  const [cameraOn , setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [subtitle, setSubtitle] = useState("");

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const candidateName = queryParams.get("candidate") || "Candidate";
  const recruiterName = queryParams.get("recruiter") || "Recruiter";

  const storedUser = localStorage.getItem('user');
  let user;
  if(storedUser){
    user = JSON.parse(storedUser);
  }
  
  const handleEndCall = async () => {
    try {
      const meetingLink = new URLSearchParams(window.location.search).get("roomId");
      console.log("Meeting Link:",meetingLink);
     
      if(user?.role==="recruiter"){
        const res = await axios.get(`${BASE_URL}/interviews/complete/${meetingLink}`);
      }
      
    } catch (error) {
      console.log("HandleEndCall Error:",error);
    }
    window.location.href = "/";
  };

  const roomId = queryParams.get("roomId") || "default-room";
  useSubtitles(roomId, setSubtitle);
  return (
    <div className="min-h-screen pb-0 bg-white">
      

      <div className="flex flex-row gap-4 h-[85vh] px-4 pt-4">
        
        <div className="flex flex-col w-1/2 h-full gap-4">
        {user?.role === "candidate" ? (
    <>
      
      <div className="flex-1 overflow-hidden bg-white border rounded-lg shadow-sm">
        <div className="p-4 h-[calc(100%-48px)] flex items-center justify-center">
          <WebRTCComponent />
        </div>
        <h2 className="p-3 text-lg font-semibold border-b">{recruiterName}</h2>
      </div>

      
      <div className="flex-1 overflow-hidden bg-white border rounded-lg shadow-sm">
        <div className="p-4 h-[calc(100%-48px)] flex items-center justify-center">
          <CameraPreview cameraOn={cameraOn} micOn={micOn}/>
        </div>
        <h2 className="p-3 text-lg font-semibold border-b">{candidateName}</h2>
      </div>
    </>
  ) : (
    <>
      
      <div className="flex-1 overflow-hidden bg-white border rounded-lg shadow-sm">
        <div className="p-4 h-[calc(100%-48px)] flex items-center justify-center">
          <WebRTCComponent />
        </div>
        <h2 className="p-3 text-lg font-semibold border-b">{candidateName}</h2>
      </div>

      
      <div className="flex-1 overflow-hidden bg-white border rounded-lg shadow-sm">
        <div className="p-4 h-[calc(100%-48px)] flex items-center justify-center">
          <CameraPreview cameraOn={cameraOn} micOn={micOn}/>
        </div>
        <h2 className="p-3 text-lg font-semibold border-b">{recruiterName}</h2>
      </div>
    </>
  )}
        </div>

        
        <div className="w-4/5 h-full p-4 overflow-hidden bg-white border rounded-lg shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Code Editor</h2>
          <div className="h-full p-4 bg-gray-100 rounded-md">
            <CodeEditor/>
          </div>
        </div>
      </div>

      {subtitle && (
        <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 bg-black bg-opacity-75 text-white text-lg rounded-2xl shadow-lg max-w-[80%] text-center animate-fadeIn">
          {subtitle}
        </div>
      )}
      <div className="flex items-center justify-center gap-3 p-2 bg-white border-t border-gray-300">
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
        
        <button className="p-3 bg-red-600 rounded-full">
          <Phone className="w-6 h-6 text-white" onClick={handleEndCall}/>
        </button>
      </div>
    </div>
  );
};

export default InterviewRoom;