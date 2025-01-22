import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageUrl, scenario } = body;

    if (!imageUrl || !scenario) {
      return NextResponse.json(
        { error: "Both imageUrl and scenario are required" },
        { status: 400 }
      );
    }


    const prompt = ` Scenario: ${scenario}`;
    const image = imageUrl;

   
    const replicateModelVersion =
      "0827b64897df7b6e8c04625167bbb275b9db0f14ab09e2454b9824141963c966"; 

    
    const replicateApiKey = process.env.REPLICATE_API_KEY;

    if (!replicateApiKey) {
      console.error("Replicate API key is missing!");
      return NextResponse.json(
        { error: "Replicate API key is missing" },
        { status: 500 }
      );
    }

    
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${replicateApiKey}`, 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: replicateModelVersion,
        input: {
          image,
          prompt,
        },
      }),
    });

    const responseData = await response.json();

    console.log("Replicate API Response:", responseData);

   
    if (!response.ok || !responseData.id) {
      console.error("Error starting image generation:", responseData);
      return NextResponse.json(
        { error: "Failed to start image generation" },
        { status: 500 }
      );
    }

    const predictionId = responseData.id;

    let status = responseData.status;
    let imageUrlGenerated = "";

    while (status !== "succeeded" && status !== "failed") {
  
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${replicateApiKey}`,
          },
        }
      );

      const statusData = await statusResponse.json();
      status = statusData.status;

      if (status === "succeeded") {
        imageUrlGenerated = statusData.output[0]; 
        break;
      }

      if (status === "failed") {
        console.error("Image generation failed");
        return NextResponse.json(
          { error: "Image generation failed" },
          { status: 500 }
        );
      }

      
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (!imageUrlGenerated) {
      return NextResponse.json(
        { error: "Image generation did not complete successfully" },
        { status: 500 }
      );
    }

    return NextResponse.json({generatedImageUrl: imageUrlGenerated });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
