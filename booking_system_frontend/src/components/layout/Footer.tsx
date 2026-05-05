import { LogoGithub, Favorite } from '@carbon/icons-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <div>© {currentYear} Galaxium Travels. All rights reserved.</div>

        <div className="app-footer__group">
          <span>Made with</span>
          <Favorite size={16} style={{ color: 'var(--nebula-pink)' }} />
          <span>for space travelers</span>
        </div>

        <div className="app-footer__group">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="app-footer__link"
            aria-label="GitHub"
          >
            <LogoGithub size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
};

// Made with Bob
