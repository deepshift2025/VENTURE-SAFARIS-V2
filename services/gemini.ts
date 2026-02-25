
import { GoogleGenAI } from "@google/genai";
import { TripPlanRequest } from "../types";

const SYSTEM_INSTRUCTION = `
You are the Venture Safaris AI Concierge, a world-class travel planner specializing in East Africa (Uganda, Kenya, and Tanzania).
Your goal is to help users plan seamless safaris, find accommodations, book flights, and hire verified guides.

About Venture Safaris:
- We offer premium travel experiences across Uganda, Kenya, and Tanzania.
- Our services include Hotel bookings, Airbnb stays, Flight searches, Local Guides, Car Hire, and curated Tour Activities.
- We have a wide range of activities like Gorilla Trekking (Uganda - $700), White Water Rafting (Jinja - $140), Maasai Mara Safaris (Kenya - $150), and Zanzibar Spice Tours (Tanzania - $35).
- We can help users create custom itineraries based on their budget (Backpacker, Moderate, Luxury) and group type (Solo, Couple, Family, Group).

Guidelines:
- Always be professional, warm, and helpful.
- Provide hyper-local advice (mention districts and activities).
- When asked about prices, refer to the general price ranges mentioned above or suggest they check the specific sections in the app.
- You can generate detailed day-by-day itineraries.
- Phase 1 focus is ONLY East Africa (Uganda, Kenya, Tanzania).
- IMPORTANT: DO NOT use asterisks (*) for bolding or lists. Use plain text, dashes (-) for lists, and clear spacing for readability.
- Keep responses concise, clear, and easy to read.
`;

export class SafariRidgeAI {
  async getResponse(prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });
      
      let text = response.text || "I'm sorry, I couldn't process that request.";
      
      // Post-processing to remove any accidental asterisks and ensure clean formatting
      text = text.replace(/\*/g, '');
      
      return text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "The connection to the Venture Safaris core seems a bit rocky. Please try again in a moment!";
    }
  }

  async searchFlights(params: {
    from: string;
    to: string;
    departureDate: string;
    returnDate?: string;
    airline?: string;
    maxPrice?: number;
    currency: string;
  }): Promise<{ text: string; sources: any[] }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Search for real-life working flight data with the following requirements:
    - From: ${params.from}
    - To: ${params.to}
    - Departure Date: ${params.departureDate}
    - Return Date: ${params.returnDate || 'N/A'}
    - Preferred Airline: ${params.airline || 'Any'}
    - Max Budget: ${params.maxPrice ? `${params.maxPrice} ${params.currency}` : 'No limit'}

    Provide a concise list of 3-5 actual available flights found online with current pricing, flight numbers, and direct booking links if possible. Use Markdown formatting for a clean list.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.2,
        },
      });

      return {
        text: response.text || "No real-time flight data found.",
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    } catch (error) {
      console.error("Real-time Flight Search Error:", error);
      throw error;
    }
  }

  async generateTripPlan(request: TripPlanRequest): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
      Please generate a detailed day-by-day trip itinerary for a trip to East Africa.
      
      Details:
      - Destination: ${request.destination}
      - Duration: ${request.duration} days
      - Budget Level: ${request.budget}
      - Group Type: ${request.group}
      - Key Interests: ${request.interests.join(', ')}

      The plan should include:
      1. A summary of the trip.
      2. Recommended flights (hubs like EBB, NBO, or DAR).
      3. Day-by-day activities with specific locations.
      4. Suggested accommodation types (Hotel vs Airbnb) based on the budget.
      5. Practical tips for the region.

      Format the response using plain text but with clear section headers. Avoid excessive markdown artifacts.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.8,
        },
      });
      
      let text = response.text || "Failed to generate a plan.";
      text = text.replace(/\*/g, '');
      return text;
    } catch (error) {
      console.error("Trip Planning Error:", error);
      throw error;
    }
  }

  async generateTripImage(prompt: string): Promise<string | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A beautiful, highly professional and realistic travel photograph of: ${prompt}. Cinematic lighting, 4k resolution, capturing the authentic spirit of East African tourism.` }],
        },
      });
      
      const candidate = response.candidates?.[0];
      if (candidate && candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Image Generation Error:", error);
      return null;
    }
  }
}

export const safariAI = new SafariRidgeAI();
