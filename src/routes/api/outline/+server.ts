import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

//  import { session } from '$app/stores';



import { env } from '$env/dynamic/private';
// You may want to replace the above with a static private env variable
// for dead-code elimination and build-time type-checking:
// import { OPENAI_API_KEY } from '$env/static/private'

import type { RequestHandler } from './$types';
const apiKey = import.meta.env.VITE_OPENAI_API_KEY //env.OPENAI_API_KEY 
// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: apiKey
});

// console.log("I AMsdsdsd  API KEy", apiKey)

export const POST = (async ({ request }) => {
  // Extract the `prompt` from the body of the request
  const { prompt } = await request.json();

  console.log("GOT DA PIIIIIGGG API", request)


  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    // messages: messages.map((message: any) => ({
    //   content: message.content,
    //   role: message.role,
    // })),
    messages: [
      {
        role: 'user',
        content: `Given this ${prompt}, which are relationships between 'source' entities and their 'target' attributes, output a structured outline in markdown format. Each 'source' should be a main section header, while each 'target' should be a sub-point under its respective source. 

              Data:
              { source: "Software Engineer", target: "Programming", value: 1 },
              { source: "Software Engineer", target: "Debugging", value: 1 },
              { source: "Software Engineer", target: "Software Design", value: 1 },
              { source: "Programming", target: "Languages", value: 0.8 },
              ...[rest of your data]...
              
              Should be translated into a markdown outline like this:

              ## Software Engineer
              - Programming
              - Debugging
              - Software Design
              ...

              ## Programming
              - Languages
              ...`
        // prompt,
      },
      {
        role: 'assistant',
        content: '',
      },
    ],
    max_tokens: 1000,
    temperature: 0.5, // Adjust as needed for creativity vs consistency
    top_p: 1,
    frequency_penalty: 0.5, // Adjust as needed
    presence_penalty: 0.5, // Adjust as needed
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  console.log("STREAM", stream)
  // Respond with the stream
  return new StreamingTextResponse(stream);
}) satisfies RequestHandler;
