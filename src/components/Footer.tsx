import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          Created by <span className="author-name">Zaid Tehsin</span> with the help of <span className="ai-name">AI</span>
        </p>
        <p className="footer-year">© {currentYear} File Finder. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
