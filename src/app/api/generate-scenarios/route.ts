import { CohereClientV2 } from 'cohere-ai';

if (!process.env.COHERE_API_KEY) {
  throw new Error('COHERE_API_KEY is not set in the environment variables.');
}

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

interface CohereGeneration {
  text: string;
}

export async function POST(req: Request): Promise<Response> {
  const { prompt }: { prompt: string } = await req.json();

  try {
    const response = await cohere.generate({
      model: 'command-xlarge',
      prompt: `Generate a single, concise, and actionable scenario based on the input. The scenario should be clear, directive, and easily tied to an image for editing.\n\nInput: "${prompt}"\n\nScenario:`,
      maxTokens: 100,
      temperature: 0.7,
      numGenerations: 4,
    });

    console.log(response);

    const scenarios: string[] = Array.isArray(response.generations)
      ? response.generations.map((gen: CohereGeneration) => gen.text)
      : [];

    return new Response(JSON.stringify({ success: true, scenarios }), {
      status: 200,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error generating text:', error.message);
      return new Response(
        JSON.stringify({ success: false, message: error.message }),
        { status: 500 }
      );
    } else {
      console.error('Unknown error:', error);
      return new Response(
        JSON.stringify({ success: false, message: 'An unexpected error occurred' }),
        { status: 500 }
      );
    }
  }
}
