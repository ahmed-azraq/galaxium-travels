import type { ReactNode } from 'react';
import { Tile, ClickableTile } from '@carbon/react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card = ({ children, className, onClick }: CardProps) => {
  const mergedClassName = ['tile-reset', className].filter(Boolean).join(' ');

  if (onClick) {
    return (
      <ClickableTile className={mergedClassName} onClick={onClick}>
        {children}
      </ClickableTile>
    );
  }

  return <Tile className={mergedClassName}>{children}</Tile>;
};

// Made with Bob
