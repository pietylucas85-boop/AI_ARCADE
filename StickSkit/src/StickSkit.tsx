import React, { useState, useEffect, useMemo } from 'react';

// --- TYPES ---
export type Vibe = 'kid' | 'sarcastic' | 'professional' | 'gamer' | 'chaos';

export interface UserContext {
    age?: number;
    vibe?: Vibe;
    taskName?: string; // e.g., "Saving", "Uploading"
}

interface Skit {
    id: string;
    vibes: Vibe[];
    q: string; // Character A
    t: string; // Character B
    action?: 'fight' | 'dance' | 'idle' | 'panic';
}

// --- CONTENT DATABASE ---
const SKIT_DB: Skit[] = [
    // KID VIBE
    { id: 'k1', vibes: ['kid'], q: "Are we there yet?", t: "No! I'm still counting pixels!" },
    { id: 'k2', vibes: ['kid'], q: "I'm hungry!", t: "Eat some data bytes. Nom nom." },
    { id: 'k3', vibes: ['kid'], q: "Look! A butterfly!", t: "Focus! We are loading!" },

    // SARCASTIC VIBE
    { id: 's1', vibes: ['sarcastic'], q: "Still loading...", t: "Riveting content, I know." },
    { id: 's2', vibes: ['sarcastic'], q: "Do I have to?", t: "Yes. It's in the code. Unfortunately." },
    { id: 's3', vibes: ['sarcastic'], q: "Error 404: Motivation not found.", t: "Just spin the circle and smile." },

    // PROFESSIONAL VIBE
    { id: 'p1', vibes: ['professional'], q: "Synergizing the assets...", t: "Let's circle back on that." },
    { id: 'p2', vibes: ['professional'], q: "Is this scalable?", t: "It's loading, isn't it? Good enough." },
    { id: 'p3', vibes: ['professional'], q: "Generating value...", t: "Please hold for stakeholder approval." },

    // GAMER VIBE
    { id: 'g1', vibes: ['gamer'], q: "Lag!", t: "It's not lag, it's a feature." },
    { id: 'g2', vibes: ['gamer'], q: "Spawning boss...", t: "I forgot my health potions." },
    { id: 'g3', vibes: ['gamer'], q: "Loading textures...", t: "My graphics card is crying." },

    // CHAOS (Default/Universal)
    { id: 'c1', vibes: ['chaos', 'kid', 'sarcastic', 'professional', 'gamer'], q: "What if we just... exploded?", t: "Safety protocols engaged." },
    { id: 'c2', vibes: ['chaos', 'kid', 'sarcastic', 'professional', 'gamer'], q: "Calculating infinity...", t: "I ran out of fingers." },
];

// --- ENGINE ---
const getVibeFromAge = (age: number): Vibe => {
    if (age < 13) return 'kid';
    if (age < 25) return 'gamer'; // Generalizing for demo
    if (age < 40) return 'sarcastic';
    return 'professional';
};

const selectSkit = (context: UserContext): Skit => {
    let targetVibe = context.vibe;
    if (!targetVibe && context.age) {
        targetVibe = getVibeFromAge(context.age);
    }
    if (!targetVibe) targetVibe = 'chaos';

    const candidates = SKIT_DB.filter(s => s.vibes.includes(targetVibe!));
    const fallback = SKIT_DB.filter(s => s.vibes.includes('chaos'));

    const pool = candidates.length > 0 ? candidates : fallback;
    return pool[Math.floor(Math.random() * pool.length)];
};

// --- COMPONENT ---
export const StickSkit: React.FC<UserContext> = (props) => {
    const [skit, setSkit] = useState<Skit>(selectSkit(props));
    const [frame, setFrame] = useState(0);

    // Change skit every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setSkit(selectSkit(props));
        }, 3000);
        return () => clearInterval(interval);
    }, [props.vibe, props.age]);

    // Animation loop
    useEffect(() => {
        const anim = setInterval(() => setFrame(f => f + 1), 100);
        return () => clearInterval(anim);
    }, []);

    return (
        <div style={{
            fontFamily: 'monospace',
            padding: '20px',
            background: 'rgba(0,0,0,0.8)',
            color: '#0f0',
            borderRadius: '10px',
            border: '1px solid #0f0',
            maxWidth: '400px',
            textAlign: 'center'
        }}>
            {/* THE STAGE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '100px', marginBottom: '20px' }}>

                {/* FIGURE A */}
                <div style={{ transform: `translateY(${Math.sin(frame / 2) * 5}px)` }}>
                    <div style={{ width: '20px', height: '20px', border: '2px solid #0ff', borderRadius: '50%', margin: '0 auto' }}></div>
                    <div style={{ width: '2px', height: '30px', background: '#0ff', margin: '0 auto' }}></div>
                    <div style={{ width: '30px', height: '2px', background: '#0ff', margin: '-20px auto 0' }}></div>
                    <div style={{ width: '30px', height: '30px', borderTop: '2px solid #0ff', borderRight: '2px solid #0ff', transform: 'rotate(45deg)', margin: '10px auto 0' }}></div>
                </div>

                {/* VS */}
                <div style={{ fontSize: '20px', opacity: 0.5 }}>VS</div>

                {/* FIGURE B */}
                <div style={{ transform: `translateY(${Math.cos(frame / 2) * 5}px)` }}>
                    <div style={{ width: '20px', height: '20px', border: '2px solid #f0f', borderRadius: '5px', margin: '0 auto' }}></div>
                    <div style={{ width: '2px', height: '30px', background: '#f0f', margin: '0 auto' }}></div>
                    <div style={{ width: '30px', height: '2px', background: '#f0f', margin: '-20px auto 0' }}></div>
                    <div style={{ width: '2px', height: '30px', background: '#f0f', margin: '0 auto' }}></div>
                </div>

            </div>

            {/* THE DIALOGUE */}
            <div style={{ textAlign: 'left', marginBottom: '5px', color: '#0ff' }}>
                <strong>A:</strong> {skit.q}
            </div>
            <div style={{ textAlign: 'right', color: '#f0f' }}>
                <strong>B:</strong> {skit.t}
            </div>

        </div>
    );
};
