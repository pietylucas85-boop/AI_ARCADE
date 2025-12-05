export interface ColorPalette {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
}

export interface Artwork {
    title: string;
    description: string;
    category: string;
    imageDataUrl: string; // The base64 URL of the user's uploaded image
}

export interface Portfolio {
    artistName: string;
    biography: string;
    artistStatement: string;
    colorPalette: ColorPalette;
    artworks: Artwork[];
}

export interface OnboardingData {
    name: string;
    description: string;
    files: File[];
    usePlaceholders?: boolean; // Added for placeholder option
}

export type VoiceTargetField = 'name' | 'description' | null;
