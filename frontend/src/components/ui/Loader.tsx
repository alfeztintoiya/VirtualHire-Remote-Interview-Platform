import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-16 h-16 ease-linear border-8 border-t-8 border-gray-200 rounded-full loader"></div>
    </div>
  );
};

export default Loader;
