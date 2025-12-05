
import { GoogleGenAI } from "@google/genai";
import { ItemModel } from "../types";
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// DEMO MODE: Client-side Key. PRODUCTION MODE: Cloud Functions.
const USE_CLOUD_FUNCTIONS = false; // Set to true when backend is deployed

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Proxy wrapper to route calls either directly (demo) or via Cloud Function (prod).
 */
const callGemini = async (model: string, prompt: string | any, tools: any = null) => {
  if (USE_CLOUD_FUNCTIONS) {
    const secureGenerate = httpsCallable(functions, 'secureGenerateContent');
    const result: any = await secureGenerate({ model, prompt, tools });
    return result.data;
  } else {
    // Direct Client Call
    const config: any = {};
    if (tools) config.tools = tools;
    
    // Handle different prompt structures (text vs parts)
    let contents = prompt;
    if (typeof prompt === 'string') {
        contents = { parts: [{ text: prompt }] };
    }

    return await ai.models.generateContent({
      model,
      contents,
      config
    });
  }
};

export const analyzeImageForSearch = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const prompt = {
        parts: [
          { text: "Analyze this image. Identify the item name, brand, model, and condition. Return ONLY a specific search query string optimized for a marketplace (e.g. 'Used Herman Miller Aeron Chair size B')." },
          { inlineData: { data: base64Data, mimeType } }
        ]
    };

    const response = await callGemini('gemini-2.5-flash-image', prompt);
    return response.text?.trim() || "unknown item";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw new Error("Failed to analyze image.");
  }
};

export const enhanceSearchQuery = async (rawInput: string): Promise<string> => {
  try {
    const prompt = `Convert this input into a precise marketplace search query. 
    Input: "${rawInput}"
    Output (Text only):`;
    
    const response = await callGemini('gemini-2.5-flash', prompt);
    return response.text?.trim() || rawInput;
  } catch (error) {
    return rawInput;
  }
};

export const findListingsWithGemini = async (
  query: string, 
  lat?: number, 
  lng?: number,
  page: number = 1
): Promise<Partial<ItemModel>[]> => {
  try {
    const locationContext = (lat && lng) 
      ? `near latitude ${lat}, longitude ${lng}` 
      : "in the US";

    // Optimized prompt for real scraping-like behavior via Grounding
    const prompt = `
      I need to find valid, active secondhand listings for "${query}" ${locationContext}.
      Focus on Facebook Marketplace, OfferUp, Craigslist, eBay, and Mercari.
      
      Find exactly 8 unique items.
      
      Strictly return a plain text list. Format each line exactly like this:
      TITLE | PRICE (number) | SOURCE | LOCATION/DISTANCE | URL | CONDITION
      
      Example:
      Nintendo Switch OLED | 250 | Facebook Marketplace | 3 miles | https://facebook.com/marketplace/item/123 | Like New
      
      Do not add numbering. Do not use Markdown.
    `;

    const response = await callGemini('gemini-2.5-flash', prompt, [{ googleSearch: {} }]);
    const text = response.text || '';
    
    // Parse the pipe-delimited response
    const parsedItems: Partial<ItemModel>[] = text.split('\n')
      .map(line => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length < 5) return null;
        
        const price = parseFloat(parts[1].replace(/[^0-9.]/g, ''));
        if (isNaN(price)) return null;

        // Extract distance number if possible
        const distMatch = parts[3].match(/(\d+(\.\d+)?)/);
        const distance = distMatch ? parseFloat(distMatch[0]) : 0;

        return {
          title: parts[0],
          price: price,
          source: parts[2],
          location: parts[3],
          distanceMiles: distance,
          itemUrl: parts[4],
          condition: (parts[5] as any) || 'Used',
          currency: 'USD'
        };
      })
      .filter((i): i is Partial<ItemModel> => i !== null);

    return parsedItems;

  } catch (error) {
    console.error("Gemini Search Grounding Error:", error);
    return [];
  }
};
