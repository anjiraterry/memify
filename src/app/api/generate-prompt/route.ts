import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

if (!process.env.HUGGINGFACE_API_KEY) {
  throw new Error("HUGGINGFACE_API_KEY is not set in the environment variables.");
}


interface HuggingFaceResponse {
  generated_text: string;
}

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const apiUrl = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large";
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: imageUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error from Hugging Face API:", error);
      return NextResponse.json({ error }, { status: response.status });
    }


    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Unexpected API response format" }, { status: 500 });
    }


    const validData = data.every(
      (item) => typeof item === "object" && item !== null && "generated_text" in item && typeof item.generated_text === "string"
    );

    if (!validData) {
      return NextResponse.json({ error: "Unexpected API response format" }, { status: 500 });
    }

    const prompt = (data as HuggingFaceResponse[])[0].generated_text;

    return NextResponse.json({ prompt });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error generating description:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("Unknown error occurred:", error);
      return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
  }
}
