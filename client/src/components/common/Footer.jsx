import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} KaamLink. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="/terms" className="hover:text-primary">
            Terms
          </a>
          <a href="/privacy" className="hover:text-primary">
            Privacy
          </a>
          <a href="/safety" className="hover:text-primary">
            Safety
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

