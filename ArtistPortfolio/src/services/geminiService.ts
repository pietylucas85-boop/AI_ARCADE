import { GoogleGenAI, Type } from "@google/genai";
import type { OnboardingData, Portfolio, Artwork, ColorPalette } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Utility to convert a File object to a GoogleGenerativeAI.Part
const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            }
        };
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const generatePortfolioContent = async (data: OnboardingData): Promise<Portfolio> => {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imageParts = await Promise.all(data.files.map(fileToGenerativePart));

    const prompt = `
    You are an expert portfolio designer. Given the artist's name, description, and uploaded artwork images, generate a complete portfolio including:
    1.  Artist Name: ${data.name}
    2.  Biography: A compelling biography based on the description: "${data.description}".
    3.  Artist Statement: A concise artist statement reflecting the style and themes in the description and artworks.
    4.  Color Palette: Suggest a 5-color palette (background, foreground, primary, secondary, accent) in hex codes that complements the artworks and description.
    5.  Artworks: For each uploaded image, provide a title, a brief description, and categorize it (e.g., "Oil Painting", "Digital Art", "Sculpture", "Abstract", "Portrait").

    Artist Description: ${data.description}

    Output the result as a JSON object matching the Portfolio interface:
    {
      "artistName": "string",
      "biography": "string",
      "artistStatement": "string",
      "colorPalette": {
        "background": "#XXXXXX",
        "foreground": "#XXXXXX",
        "primary": "#XXXXXX",
        "secondary": "#XXXXXX",
        "accent": "#XXXXXX"
      },
      "artworks": [
        { "title": "string", "description": "string", "category": "string", "imageDataUrl": "data:[mimetype];base64,[base64_string_from_file_0]" },
        { "title": "string", "description": "string", "category": "string", "imageDataUrl": "data:[mimetype];base64,[base64_string_from_file_1]" },
        ...
      ]
    }
    For imageDataUrl, use the base64 encoded data from the uploaded files I provide. I will provide ${data.files.length} images.
  `;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = result.response;
    const text = response.text();

    try {
        const portfolioData = JSON.parse(text);
        // Combine generated data with original image data URLs
        portfolioData.artworks = portfolioData.artworks.map((artwork: any, index: number) => ({
            ...artwork,
            imageDataUrl: `data:${data.files[index].type};base64,${(imageParts[index] as any).inlineData.data}`
        }));
        return portfolioData as Portfolio;
    } catch (e) {
        console.error("Failed to parse Gemini response:", text, e);
        throw new Error("Failed to generate portfolio content from AI response.");
    }
};

export const generatePlaceholderImages = async (description: string, count: number): Promise<File[]> => {
    const model = ai.getGenerativeModel({ model: "imagen-3" }); // Or another suitable Imagen model
    const files: File[] = [];

    for (let i = 0; i < count; i++) {
        const prompt = `Generate an abstract or representative artwork based on the following artist description: "${description}". Image ${i + 1} of ${count}.`;
        try {
            const result = await model.generateContent(prompt);
            // Assuming the Imagen API returns image data directly or via a URL we fetch
            // This part needs adjustment based on the actual Imagen API response format
            const response = await result.response;
            // If response contains image bytes directly (e.g., base64)
            const base64Data = response.text(); // Or however the base64 is accessed
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let j = 0; j < byteCharacters.length; j++) {
                byteNumbers[j] = byteCharacters.charCodeAt(j);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' }); // Adjust MIME type if needed
            files.push(new File([blob], `placeholder_${i + 1}.jpg`, { type: 'image/jpeg' }));

        } catch (error) {
            console.error(`Failed to generate placeholder image ${i + 1}:`, error);
            // Optionally skip or add a default placeholder
        }
    }
    return files;
};
