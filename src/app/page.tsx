import React from "react";
import ImageUploader from "../components/ImageUploader";

const Home: React.FC = () => {
  return (
    <div
      className="p-20 "
      style={{
        backgroundColor: "#0B0B10", 
        fontFamily: "'DM Sans', sans-serif",
        color: "#EAEAEA", 
      }}
    >
      <div className="h-full flex flex-col items-center justify-center">
        <h1 className="text-6xl font-sans text-zinc-300 font-bold mb-8">Memify</h1>
        <ImageUploader />
      </div>
    </div>
  );
};

export default Home;
