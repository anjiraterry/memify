import React from "react";
import ImageUploader from "../components/ImageUploader";

const Home: React.FC = () => {
  return (
    <div
      className="h-screen p-40"
      style={{
        backgroundColor: "#0B0B10", // Near-black with a hint of dark purple/blue
        fontFamily: "'DM Sans', sans-serif", // Modern sans-serif font
        color: "#EAEAEA", // Light text for readability
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
