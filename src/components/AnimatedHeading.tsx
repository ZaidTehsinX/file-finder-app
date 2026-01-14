import React from 'react';
import './AnimatedHeading.css';

const AnimatedHeading: React.FC = () => {
  return (
    <div className="heading-container">
      <h1 className="animated-heading">
        <span className="word file-word">File</span>
        <span className="word finder-word">Finder</span>
      </h1>
    </div>
  );
};

export default AnimatedHeading;
