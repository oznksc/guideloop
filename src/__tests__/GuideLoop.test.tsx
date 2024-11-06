// src/__tests__/GuideLoop.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import GuideLoop from '../components/GuideLoop';

describe('GuideLoop', () => {
  const mockSteps = [
    {
      target: '#test',
      title: 'Test Title',
      content: 'Test Content'
    }
  ];

  it('renders nothing when isOpen is false', () => {
    render(
      <GuideLoop
        steps={mockSteps}
        isOpen={false}
        onClose={() => {}}
      />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <GuideLoop
        steps={mockSteps}
        isOpen={true}
        onClose={() => {}}
      />
    );
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});