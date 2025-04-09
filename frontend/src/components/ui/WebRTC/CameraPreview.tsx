import { Camera } from "lucide-react";
import React, { useRef, useEffect ,useState} from "react";

interface CameraPreviewProps{
  cameraOn: boolean;
  micOn: boolean;
}


const CameraPreview: React.FC<CameraPreviewProps> = ({ cameraOn,micOn}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamStarted, setStreamStarted] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        stream.getVideoTracks().forEach((track)=> (track.enabled = cameraOn));
        stream.getAudioTracks().forEach((track)=> (track.enabled = micOn));

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStreamStarted(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startCamera();

    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraOn,micOn]);

  return (
    <div className="h-full">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="object-contain w-full h-full bg-gray-100 rounded-md"
      />
    </div>
  );
};

export default CameraPreview;