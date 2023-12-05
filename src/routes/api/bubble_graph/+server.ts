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

let directiveToApi = ''
// console.log("I AMsdsdsd  API KEy", apiKey)

export const POST = (async ({ request }) => {
  // Extract the `prompt` from the body of the request
  const { prompt } = await request.json();

  console.log("i is prompt", prompt)

  if (prompt.startsWith("make_outline_320_")) {
    // The prompt starts with "make_outline_320_"
    // Do whatever you want in this condition
    directiveToApi = `Given this ${prompt}, which are relationships between 'source' entities and their 'target' attributes, output a structured outline in markdown format. Each 'source' should be a main section header, while each 'target' should be a sub-point under its respective source. 

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
} else {
    // The prompt does not start with "make_outline_320_"
    // Handle accordingly
    directiveToApi = `generate a JSON data structure that conceptualizes the key elements related to ${prompt}. The structure should represent relationships between the key elements in the format and there should be at least 30 or more relationships.:
    [
        {source: "PrimaryElement", target: "RelatedElement", value: SomeNumericValue},
        // ... more relationships
    ]
    ---
    Response to the prompt might look like:
    [
        {source: "Software Engineer", target: "Programming", value: 1},
        {source: "Software Engineer", target: "Debugging", value: 1},
        {source: "Software Engineer", target: "Software Design", value: 1},
        {source: "Software Engineer", target: "Version Control", value: 1},
        {source: "Software Engineer", target: "Continuous Integration", value: 1},
        {source: "Programming", target: "Languages", value: 0.8},
        {source: "Programming", target: "Frameworks", value: 0.7}
    ]
    Note: The 'value' field is a subjective measure, which could indicate the strength of the relationship or some other metric. The above example uses arbitrary values for demonstration purposes. Only output valid JSON`
}


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
              content: directiveToApi
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
