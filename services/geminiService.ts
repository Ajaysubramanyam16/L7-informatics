import { GoogleGenAI, Type } from "@google/genai";
import { Expense } from "../types";

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
    // Limit to last 50 expenses to avoid token limits in this demo
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
