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

  // console.log("GOT DA PIIIIIGGG API", request)


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
              content: `Create an HTML file with HTML, JavaScript, and CSS based on the following user inquiry: ${prompt}. Please only output valid HTML, CSS, and JavaScript code in one file and do not output anything that is not code.`
              // prompt,
            },
            {
              role: 'assistant',
              content: '',
            },
          ],
          max_tokens: 200,
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
