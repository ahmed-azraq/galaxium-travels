import type { ReactNode } from 'react';
import { Button as CarbonButton } from '@carbon/react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  type = 'button',
  onClick,
}: ButtonProps) => {
  const carbonKind =
    variant === 'primary' ? 'primary' :
    variant === 'secondary' ? 'secondary' :
    variant === 'danger' ? 'danger' : 'primary';

  const carbonSize =
    size === 'sm' ? 'sm' :
    size === 'md' ? 'md' :
    size === 'lg' ? 'lg' : 'md';

  return (
    <CarbonButton
      kind={carbonKind}
      size={carbonSize}
      disabled={disabled || isLoading}
      type={type}
      onClick={onClick}
      className={className}
      style={{
        width: className?.includes('w-full') || className?.includes('flex-1') ? '100%' : undefined,
      }}
    >
      {isLoading ? 'Loading...' : children}
    </CarbonButton>
  );
};

// Made with Bob
