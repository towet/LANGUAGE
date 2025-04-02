import { GoogleGenerativeAI } from "@google/generative-ai";
import { KnowledgeEntry, searchKnowledgeBase } from '../data/knowledgeBase';

// Initialize with API key
const genAI = new GoogleGenerativeAI("AIzaSyDuWyN3Cz490QF5Zp1f10kUOy8yLB8UqjU");

export async function getGeminiResponse(prompt: string) {
  try {
    // Search knowledge base for relevant information
    const relevantEntries = searchKnowledgeBase(prompt);
    
    // Construct context from relevant knowledge base entries
    const knowledgeContext = relevantEntries.map(entry => 
      `${entry.topic}:\n${entry.content}`
    ).join('\n\n');

    // Create the prompt with context and specific instructions
    const fullPrompt = `You are a friendly and knowledgeable electronics store assistant. Your role is to help customers with product information, recommendations, technical support, and purchasing decisions.

Key Instructions:
1. Be professional and helpful in your responses
2. Provide accurate product information including prices in KSh
3. Offer relevant product comparisons and recommendations
4. Include warranty and installation information when applicable
5. Give technical support and troubleshooting guidance
6. Explain store policies clearly (returns, delivery, etc.)
7. Suggest relevant accessories or complementary products
8. If specific information isn't in the knowledge base, provide general guidance based on the product category

Knowledge Base Context:
${knowledgeContext}

Customer Question: ${prompt}

Please provide a clear, helpful response focusing on our electronics store products and services. Include specific prices, features, and relevant warranty/installation information when available. Be friendly but professional, and always prioritize accurate product information.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}