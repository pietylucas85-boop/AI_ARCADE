import { Portfolio } from './types';

export const demoPortfolio: Portfolio = {
    artistName: "Elena Vance",
    biography: "Elena Vance is a digital surrealist who explores the boundaries between organic forms and synthetic textures. With a background in classical oil painting and a passion for generative algorithms, she creates dreamlike landscapes that challenge the viewer's perception of reality. Her work has been featured in digital galleries across the metaverse and explores themes of memory, nature, and the digital sublime.",
    artistStatement: "My art is a dialogue between the chaos of nature and the precision of code. I strive to capture the fleeting moments where the two intersect, creating a visual language that speaks to the complexity of the modern human experience.",
    colorPalette: {
        background: "#0f172a", // Slate 900
        foreground: "#f8fafc", // Slate 50
        primary: "#38bdf8",    // Sky 400
        secondary: "#818cf8",  // Indigo 400
        accent: "#f472b6"      // Pink 400
    },
    artworks: [
        {
            title: "Neon Flora",
            description: "A bioluminescent garden growing in a void.",
            category: "Digital Art",
            imageDataUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop"
        },
        {
            title: "Cybernetic Roots",
            description: "Tree roots intertwining with fiber optic cables.",
            category: "Mixed Media",
            imageDataUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop"
        },
        {
            title: "Void Structure",
            description: "Abstract architectural forms floating in space.",
            category: "3D Render",
            imageDataUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=800&auto=format&fit=crop"
        }
    ]
};
