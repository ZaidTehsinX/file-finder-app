import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          Created by <span className="author-name">Zaid Tehsin</span>
        </p>
        
        <div className="tech-icons-footer">
          <span className="tech-icon-mini react" title="React">⚛️</span>
          <span className="tech-icon-mini typescript" title="TypeScript">TS</span>
          <span className="tech-icon-mini tailwind" title="Tailwind CSS">💎</span>
          <span className="tech-icon-mini nodejs" title="Node.js">🟢</span>
          <span className="tech-icon-mini express" title="Express.js">⚡</span>
          <span className="tech-icon-mini sqlite" title="SQLite">🗄️</span>
        </div>
        
        <p className="footer-year">© {currentYear} File Finder. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
