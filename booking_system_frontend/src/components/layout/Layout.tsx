import type { ReactNode } from 'react';
import { Content, Grid, Column } from '@carbon/react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Starfield } from '../common/Starfield';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="space-app-shell" style={{ display: 'flex', flexDirection: 'column' }}>
      <Starfield />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(18, 24, 38, 0.94)',
            color: '#f4f4f4',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(18px)',
            boxShadow: '0 1.5rem 3rem rgba(0, 0, 0, 0.28)',
          },
          success: {
            iconTheme: {
              primary: '#42be65',
              secondary: '#f4f4f4',
            },
          },
          error: {
            iconTheme: {
              primary: '#fa4d56',
              secondary: '#f4f4f4',
            },
          },
        }}
      />

      <Header />

      <Content
        id="main-content"
        className="relative"
        style={{
          zIndex: 1,
          flex: 1,
          paddingTop: 'calc(var(--header-height) + 2rem)',
          paddingBottom: '2rem',
        }}
      >
        <Grid fullWidth className="page-shell">
          <Column lg={16} md={8} sm={4}>
            {children}
          </Column>
        </Grid>
      </Content>

      <Footer />
    </div>
  );
};

// Made with Bob
