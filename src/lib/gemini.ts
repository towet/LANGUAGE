import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchKnowledgeBase } from '../data/knowledgeBase';

// Initialize with API key
const genAI = new GoogleGenerativeAI("AIzaSyDuWyN3Cz490QF5Zp1f10kUOy8yLB8UqjU");

type SupportedLanguage = 'English' | 'French' | 'Kiswahili';

export async function getGeminiResponse(prompt: string, selectedLanguage: SupportedLanguage = 'English') {
  try {
    // Search knowledge base for relevant information
    const relevantEntries = searchKnowledgeBase(prompt);
    
    // Construct context from relevant knowledge base entries
    const knowledgeContext = relevantEntries.map(entry => 
      `${entry.topic}:\n${entry.content}`
    ).join('\n\n');

    // Create the prompt with context and specific instructions based on the selected language
    const languageSpecificInstructions = {
      English: `You are a friendly and professional English language tutor. Your role is to:
1. Help students practice and improve their English skills
2. Provide clear explanations of grammar rules and concepts
3. Help with pronunciation and vocabulary
4. Correct mistakes gently and constructively
5. Engage in natural conversations to build speaking confidence
6. Adapt your teaching style to the student's level`,
      French: `You are a supportive and knowledgeable French language tutor. Your role is to:
1. Help students learn and practice French
2. Explain French grammar rules and concepts clearly
3. Assist with pronunciation and vocabulary
4. Provide gentle correction of mistakes
5. Engage in French conversations to build fluency
6. Adapt your teaching to match the student's proficiency level`,
      Kiswahili: `You are a patient and experienced Kiswahili language tutor. Your role is to:
1. Guide students in learning Kiswahili
2. Explain Kiswahili grammar and structure
3. Help with pronunciation and vocabulary
4. Provide constructive feedback on mistakes
5. Practice conversational Kiswahili
6. Adjust teaching methods to the student's level`
    };

    const fullPrompt = `${languageSpecificInstructions[selectedLanguage]}

Teaching Context:
- Focus on practical, everyday language use
- Encourage active participation
- Provide examples and practice opportunities
- Use positive reinforcement
- Keep responses clear and engaging

Knowledge Base Context:
${knowledgeContext}

Student Question: ${prompt}

Please respond as a language tutor, focusing on helping the student learn and practice ${selectedLanguage}. Provide explanations, corrections, and encouragement as appropriate.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}