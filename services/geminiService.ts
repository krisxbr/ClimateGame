import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize the client directly with the API key from environment variables as per the guidelines.
// The hosting environment is responsible for providing this value.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface PlayerChoice {
    playerName: string;
    questionText: string;
    choiceText: string;
    score: number;
}

export async function generateConsequences(scenarioTitle: string, choices: PlayerChoice[]): Promise<string> {
    const choiceSummary = choices.map(c => 
        `- ${c.playerName}'s choice: "${c.choiceText}" (Impact Score: ${c.score}) in response to "${c.questionText}"`
    ).join('\n');

    const prompt = `
        You are a fun, friendly, and slightly dramatic storyteller for 'Give Climate a ChanCe', a kids' climate adventure game. Your tone is exciting and encouraging, not scary or preachy.

        The players just finished the "${scenarioTitle}" adventure! Here's what they did (remember, a score of 1 is a super-eco choice, and 5 is the most impactful):

        ${choiceSummary}

        Now, write a 2-paragraph story about their adventure.
        1.  In the first paragraph, turn their choices into a fun narrative. For example, if they chose high-impact travel, describe them zooming around in a giant, noisy rocket-car! Connect their actions to simple, visual consequences like a "waste monster" growing bigger or a "sad cloud" appearing over the town.
        2.  In the second paragraph, give them a friendly tip for their next adventure. Focus on teamwork and simple, positive actions they could try next time. End with an exciting and hopeful message, like "Great job, Climate Heroes! The planet can't wait to see what you do next!"
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        // Access the 'text' property directly from the response object.
        return response.text;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // The error will be caught by the calling component and displayed to the user.
        throw new Error("Failed to generate content from Gemini API.");
    }
}