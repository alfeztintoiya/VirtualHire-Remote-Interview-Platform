import React from "react";
import { useParams } from "react-router-dom";
import WebRTCComponent from "@/components/ui/WebRTC/WebRTCComponent";
import CameraPreview from "@/components/ui/WebRTC/CameraPreview";
import CodeEditor from "@/components/ui/CodeEditor";


const InterviewRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}

      <div className="flex flex-row gap-4 h-[85vh] px-4 pt-4">
        {/* Left side: Video Calls */}
        <div className="flex flex-col gap-4 w-1/2 h-full">
          {/* Recruiter */}
          <div className="flex-1 border rounded-lg bg-white shadow-sm overflow-hidden">
            <div className="p-4 h-[calc(100%-48px)] flex items-center justify-center">
              <WebRTCComponent />
            </div>
            <h2 className="text-lg font-semibold p-3 border-b">Recruiter Video Call</h2>
          </div>

          {/* Candidate */}
          <div className="flex-1 border rounded-lg bg-white shadow-sm overflow-hidden">
            <div className="p-4 h-[calc(100%-48px)] flex items-center justify-center">
              <CameraPreview />
            </div>
            <h2 className="text-lg font-semibold p-3 border-b">Candidate Video Call</h2>
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

    </div>
  );
};

export default InterviewRoom;