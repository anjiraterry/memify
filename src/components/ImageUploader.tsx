"use client";

import React, { useState } from "react";
import { supabase } from "../utils/supabaseClient"; 
import { FiImage } from "react-icons/fi"; 

const ImageUploader: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setPrompt(null);
      setScenarios([]); 
    }
  };

  const uploadToSupabase = async (file: File): Promise<string | null> => {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("memifybucket")
        .upload(fileName, file);

      if (error) {
        console.error("Error uploading to Supabase:", error);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from("memifybucket")
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl || null;
    } catch (error) {
      console.error("Unexpected error during Supabase upload:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      alert("Please upload an image first.");
      return;
    }

    setIsLoading(true);

    try {
      const publicUrl = await uploadToSupabase(image);

      if (!publicUrl) {
        throw new Error("Failed to upload image to Supabase");
      }

      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: publicUrl }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to generate prompt");
      }

      setPrompt(responseData.prompt);
    } catch (error) {
      console.error("Error uploading image or generating prompt:", error);
      alert("Failed to generate a prompt. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateScenarios = async () => {
    if (!prompt) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to generate scenarios");
      }

      setScenarios(responseData.scenarios);
    } catch (error) {
      console.error("Error generating scenarios:", error);
      alert("Failed to generate scenarios. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-8 py-6 border rounded-2xl w-96 mx-auto shadow-lg">
      <label
        htmlFor="file-input"
        className="cursor-pointer flex flex-col items-center justify-center border-dashed border-2 rounded-lg h-48"
      >
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Preview"
            className="object-cover w-full h-full rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center">
            <FiImage className="w-12 h-12" />
            <p className="mt-2 text-sm">Click to upload an image</p>
          </div>
        )}
      </label>
      <input
        id="file-input"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <button
        onClick={handleSubmit}
        disabled={!image || isLoading}
        className="w-full mt-4 px-4 py-2 font-semibold rounded-lg bg-white text-black"
      >
        {isLoading ? "Generating Prompt..." : "Generate Prompt"}
      </button>

      {prompt && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="text-lg font-bold">Generated Prompt:</h3>
          <p>{prompt}</p>
          <button
            onClick={generateScenarios}
            className="w-full mt-2 px-4 py-2 font-semibold rounded-lg bg-white text-black"
          >
            Generate Scenarios
          </button>
        </div>
      )}

      {scenarios.length > 0 && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="text-lg font-bold">Generated Scenarios:</h3>
          <ul>
            {scenarios.map((scenario, index) => (
              <li key={index}>{index + 1}. {scenario}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
