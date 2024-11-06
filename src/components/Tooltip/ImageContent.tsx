import React from 'react';
import type { ImageContent } from '../GuideLoop/types';

interface ImageContentProps {
  image: ImageContent;
}

export const ImageContentRenderer: React.FC<ImageContentProps> = ({ image }) => {
  if (image.type === 'svg') {
    return (
      <div 
        className="mb-4" 
        style={{ 
          width: image.width,
          height: image.height
        }}
      >
        {image.component}
      </div>
    );
  }

  return (
    <img
      src={image.src}
      alt={image.alt || ''}
      className="mb-4 rounded-lg"
      style={{
        width: image.width,
        height: image.height,
        maxWidth: '100%',
        objectFit: 'contain'
      }}
    />
  );
};
