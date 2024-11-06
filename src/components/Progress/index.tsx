import React from 'react';
import type { ProgressProps } from './types';

export const Progress: React.FC<ProgressProps> = ({
  current,
  total,
  style = {},
}) => (
  <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2" style={{
    ...style
  }}>
    <div className="bg-white rounded-full shadow-lg px-4 py-2">
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < current ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  </div>
);