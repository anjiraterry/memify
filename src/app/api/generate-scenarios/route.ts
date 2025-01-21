import { CohereClientV2 } from 'cohere-ai';


const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY || '',
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
      numGenerations: 4     
    });


    console.log(response);

   
    const scenarios: string[] = response.generations.map((gen: CohereGeneration) => gen.text);

    return new Response(JSON.stringify({ success: true, scenarios }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error generating text:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
