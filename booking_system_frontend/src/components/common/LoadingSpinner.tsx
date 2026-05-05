import { Loading } from '@carbon/react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner = ({ size = 'md', text }: LoadingSpinnerProps) => {
  const carbonSize =
    size === 'sm' ? 'sm' :
    size === 'md' ? 'md' :
    size === 'lg' ? 'lg' : 'md';

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '14rem',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem 0',
      }}
    >
      <Loading
        description={text || 'Loading'}
        withOverlay={false}
        small={carbonSize === 'sm'}
      />
      {text ? (
        <p style={{ margin: 0, color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>{text}</p>
      ) : null}
    </div>
  );
};

// Made with Bob
