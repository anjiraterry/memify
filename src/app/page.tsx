import React from "react";
import ImageUploader from "../components/ImageUploader";

const Home: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to Memify</h1>
      <ImageUploader />
    </div>
  );
};

export default Home;
