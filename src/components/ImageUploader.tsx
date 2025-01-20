"use client";
import React, { useState } from "react";

const ImageUploader: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4"
      />
      {image && <p>Uploaded: {image.name}</p>}
    </div>
  );
};

export default ImageUploader;