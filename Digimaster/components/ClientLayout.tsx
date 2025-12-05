"use client";

import React, { useState, useEffect } from 'react';
import HolographicLoader from './HolographicLoader';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);

    // We can add logic here to check if the user has already seen the intro
    // For now, we'll show it on every refresh as requested for the "Update"

    return (
        <>
            <div className="opacity-100 transition-opacity duration-1000">
                {children}
            </div>
        </>
    );
}
