"use client";

import { useEffect } from 'react';

export default function FontLoader() {
  useEffect(() => {
    // Check if Material Icons font loaded successfully
    const checkFontLoading = () => {
      if (document.fonts) {
        document.fonts.ready.then(() => {
          const materialFont = Array.from(document.fonts).find(
            font => font.family.includes('Material')
          );
          
          if (!materialFont) {
            console.warn('Material Icons font not loaded, using fallbacks');
            // Add a class to body to indicate fallback mode
            document.body.classList.add('material-icons-fallback');
          } else {
            console.log('Material Icons loaded successfully');
            document.body.classList.add('material-icons-loaded');
          }
        });
      }
    };

    // Check font loading after a delay to ensure fonts have time to load
    const timer = setTimeout(checkFontLoading, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything
}