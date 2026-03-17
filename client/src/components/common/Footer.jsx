import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} KaamLink. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/terms" className="hover:text-primary">
            Terms
          </Link>
          <Link to="/privacy" className="hover:text-primary">
            Privacy
          </Link>
          <Link to="/safety" className="hover:text-primary">
            Safety
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

