import React, { useRef, useEffect ,useState} from "react";

const CameraPreview: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamStarted, setStreamStarted] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        // Request video and audio permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("Local stream obtained:", stream);
        // Attach the stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStreamStarted(true);
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startCamera();

    // Cleanup: Stop all tracks on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="h-full">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-contain rounded-md bg-gray-100"
      />
    </div>
  );
};

export default CameraPreview;