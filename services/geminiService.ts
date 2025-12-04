import { GoogleGenAI, Type } from "@google/genai";
import { Expense, Budget } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to parse natural language into an expense object
export const parseExpenseFromText = async (text: string): Promise<Partial<Expense> | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract expense details from this text: "${text}". 
      Return JSON with 'amount' (number), 'category' (one of: Food, Transport, Entertainment, Housing, Utilities, Health, Shopping, Other), 'description' (string), and 'date' (ISO string YYYY-MM-DD, assume current year if not specified).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            date: { type: Type.STRING }
          },
          required: ["amount", "category", "description"]
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Gemini parse error:", error);
    return null;
  }
};

export const getFinancialInsights = async (expenses: Expense[]): Promise<string> => {
  try {
    // Limit to last 50 expenses to avoid token limits
    const recentExpenses = expenses.slice(0, 50).map(e => `${e.date}: ${e.description} ($${e.amount}) - ${e.category}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze these recent expenses and provide 3 short, actionable bullet points for saving money or improving budget adherence. Be friendly but direct.
      
      Expenses:
      ${recentExpenses}`
    });

    return response.text || "No insights available at the moment.";
  } catch (error) {
    console.error("Gemini insight error:", error);
    return "Could not generate insights right now.";
  }
};

export const getChatResponse = async (
  history: { role: string; text: string }[],
  message: string,
  context: { expenses: Expense[]; budgets: Budget[] }
): Promise<string> => {
  try {
    const systemInstruction = `You are SpendSmart AI, a knowledgeable and friendly financial assistant.
    You have access to the user's financial data below. Use this context to answer their questions about spending habits, budget status, and financial advice.
    
    Current Date: ${new Date().toLocaleDateString()}
    
    Data Context:
    ${JSON.stringify(context, null, 2)}
    
    Guidelines:
    - Be concise and helpful.
    - If asked about specific transactions, reference them from the data.
    - If asked about budgets, check the limits vs spending in the data.
    - Mention if a budget is exceeded or near the limit (alert threshold).
    - Do not make up data if it's not present.
    `;

    // Convert internal message format to Gemini API format
    const contents = [
      ...history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I'm not sure how to answer that.";
  } catch (error) {
    console.error("Gemini chat error:", error);
    return "I'm having trouble connecting to the service right now. Please try again later.";
  }
};