import React, { useMemo } from 'react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  color?: string;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isPlaying, color = '#00f0ff' }) => {
  const data = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      name: i,
      value: Math.random() * 50 + 20,
    }));
  }, []);

  // In a real app, this would use requestAnimationFrame to animate based on audio data
  const animatedData = data.map(d => ({
    ...d,
    value: isPlaying ? Math.random() * 80 + 10 : d.value * 0.3
  }));

  return (
    <div className="w-full h-16">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={animatedData}>
          <Bar dataKey="value" isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={color} fillOpacity={0.6 + (index % 5) * 0.1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WaveformVisualizer;
