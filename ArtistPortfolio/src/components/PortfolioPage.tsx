import React, { useMemo } from 'react';
// FIX: Import Artwork type to be used for explicit typing.
import type { Portfolio, Artwork } from '../types';
import { ResetIcon, BrushIcon } from './IconComponents';

interface PortfolioPageProps {
    data: Portfolio;
    onReset: () => void;
}

const PortfolioPage: React.FC<PortfolioPageProps> = ({ data, onReset }) => {
    const { artistName, biography, artistStatement, colorPalette, artworks } = data;

    // FIX: The original use of a generic argument on `reduce` was causing a TypeScript error.
    // By casting the initial value of the reduce function, we explicitly tell TypeScript
    // the shape of the accumulator. This correctly types `groupedArtworks` and resolves
    // downstream errors when mapping over the grouped results.
    const groupedArtworks = useMemo(() => {
        return artworks.reduce((acc, artwork) => {
            (acc[artwork.category] = acc[artwork.category] || []).push(artwork);
            return acc;
        }, {} as Record<string, Artwork[]>);
    }, [artworks]);

    const cssVariables = {
        '--bg-color': colorPalette.background,
        '--fg-color': colorPalette.foreground,
        '--primary-color': colorPalette.primary,
        '--secondary-color': colorPalette.secondary,
        '--accent-color': colorPalette.accent,
    } as React.CSSProperties;

    return (
        <div className="min-h-screen p-8 transition-colors duration-500"
            style={{
                ...cssVariables,
                backgroundColor: 'var(--bg-color)',
                color: 'var(--fg-color)'
            }}>
            <style>
                {`
          .portfolio-container h1, .portfolio-container h2, .portfolio-container h3 { color: var(--primary-color); }
          .portfolio-container .artist-statement, .portfolio-container .biography { color: var(--secondary-color); }
          .portfolio-container .artwork-card { background-color: ${colorPalette.background}E6; border-color: var(--accent-color); }
          .portfolio-container .artwork-card:hover { border-color: var(--primary-color); }
          .portfolio-container .reset-button { background-color: var(--accent-color); color: var(--bg-color); }
          .portfolio-container .reset-button:hover { background-color: var(--primary-color); }
          .portfolio-container a { color: var(--accent-color); }
          .portfolio-container a:hover { color: var(--primary-color); }
        `}
            </style>
            <div className="portfolio-container max-w-5xl mx-auto relative">
                <button
                    onClick={onReset}
                    className="reset-button fixed top-4 right-4 z-50 flex items-center font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                    <ResetIcon className="w-5 h-5 mr-2" /> Start Over
                </button>

                <header className="text-center mb-12 pt-12">
                    <h1 className="text-5xl font-bold mb-4 flex items-center justify-center">
                        <BrushIcon className="w-10 h-10 mr-3" /> {artistName}
                    </h1>
                    <p className="text-xl artist-statement italic max-w-3xl mx-auto">{artistStatement}</p>
                </header>

                <section className="mb-12">
                    <h2 className="text-3xl font-semibold mb-6 border-b-2 pb-2" style={{ borderColor: 'var(--accent-color)' }}>Biography</h2>
                    <p className="biography text-lg leading-relaxed whitespace-pre-wrap">{biography}</p>
                </section>

                <section>
                    <h2 className="text-3xl font-semibold mb-8 border-b-2 pb-2" style={{ borderColor: 'var(--accent-color)' }}>Artwork Gallery</h2>
                    {Object.entries(groupedArtworks).map(([category, works]) => (
                        <div key={category} className="mb-10">
                            <h3 className="text-2xl font-semibold mb-6 capitalize" style={{ color: 'var(--primary-color)' }}>{category}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {works.map((artwork, index) => (
                                    <div key={index} className="artwork-card border rounded-lg overflow-hidden shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                                        style={{
                                            borderColor: 'var(--accent-color)80',
                                            backgroundColor: `rgba(${parseInt(colorPalette.background.slice(1, 3), 16)}, ${parseInt(colorPalette.background.slice(3, 5), 16)}, ${parseInt(colorPalette.background.slice(5, 7), 16)}, 0.8)`
                                        }}>
                                        <img src={artwork.imageDataUrl} alt={artwork.title} className="w-full h-64 object-cover" />
                                        <div className="p-4">
                                            <h4 className="text-xl font-bold mb-2" style={{ color: 'var(--primary-color)' }}>{artwork.title}</h4>
                                            <p className="text-sm" style={{ color: 'var(--secondary-color)' }}>{artwork.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>
            </div>
            <footer className="text-center py-8 text-sm opacity-60">
                <p>Created by Lucas | Powered by Gemini</p>
            </footer>
        </div>
    );
};

export default PortfolioPage;
