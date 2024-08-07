import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';

// Initialize the client with the API key
const client = new HfInference(process.env.HUGGINGFACE_API_KEY);

const systemPrompt = "How can I help you today?";

previous_prompts = [];

// Define a function to perform the text generation request
async function getTextGeneration(prompt) {
    try {
        // Make the text generation request with a valid model
        prompt_context = "You're a customer support agent for a tech company named 'PAAW'. You're helping a customer troubleshoot an issue with their computer. The customer says: 'My computer is running slow and I don't know why. Can you help me?' You're the customer support agent and you need to provide a helpful response to the customer. Here is the Question, answer it and always take a look at the context: \n\n";
        prompt_context += prompt;
        prompt_context += "\n\nHere are the previous prompts and their answer for the context\n\n"
        for (let i = 0; i < previous_prompts.length; i++) {
            prompt_context += previous_prompts[i] + "\n\n";
        }
        prompt = prompt_context;
        previous_prompts.push(prompt);

        const response = await client.textGeneration({
            model: "microsoft/Phi-3-mini-4k-instruct", // Use a valid model for text generation
            inputs: prompt,
            parameters: {
                max_length: 150, // Adjust length as needed
                temperature: 0.7, // Adjust temperature for creativity
                top_k: 50, // Top-k sampling
            },
        });

        // Log the response
        console.log('API Response:', response);
        
        previous_prompts.push(response.generated_text);
        return response.generated_text;
    } catch (error) {
        // Log the error for debugging
        console.error('Error:', error);
        throw error;
    }
}

// Define the API route handler
export async function POST(req) {
    try {
        // Extract user input from request
        const data = await req.json();
        const userQuery = data.query || "";

        // Combine system prompt with user query
        const fullPrompt = `${systemPrompt}\nUser: ${userQuery}\nAssistant:`;

        const assistantResponse = await getTextGeneration(fullPrompt);
        return NextResponse.json({ message: 'Response from the Assistant', data: { generated_text: assistantResponse } });
    } catch (error) {
        return NextResponse.json({ message: 'Error occurred', error: error.message }, { status: 500 });
    }
}
