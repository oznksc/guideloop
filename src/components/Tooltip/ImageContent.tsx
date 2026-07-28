import React from 'react';
import type { ImageContent } from '../GuideLoop/types';

interface ImageContentProps {
  image: ImageContent;
}

export const ImageContentRenderer: React.FC<ImageContentProps> = ({ image }) => {
  if (image.type === 'svg') {
    return (
      <div
        style={{ marginBottom: '1rem', width: image.width, height: image.height }}
      >
        {image.component}
      </div>
    );
  }

  return (
    <img
      src={image.src}
      alt={image.alt || ''}
      style={{
        marginBottom: '1rem',
        borderRadius: '0.5rem',
        width: image.width,
        height: image.height,
        maxWidth: '100%',
        objectFit: 'contain',
      }}
    />
  );
};
