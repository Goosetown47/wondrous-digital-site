import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook that handles instant scroll-to-top functionality for all links
 * Works with both regular anchor tags and React Router navigation
 */
export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Instantly scroll to top on route changes (React Router navigation)
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    /**
     * Handle clicks on regular anchor tags and external links
     * Uses event delegation to work with dynamically added content
     */
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Find the closest link element (handles nested elements within links)
      const link = target.closest('a');
      
      if (!link) return;

      // Get href attribute
      const href = link.getAttribute('href');
      
      // Skip if no href or if it's a hash link (anchor within page)
      if (!href || href.startsWith('#')) return;
      
      // Skip if it's an external link (different origin)
      if (href.startsWith('http') && !href.startsWith(window.location.origin)) return;
      
      // Skip if link has target="_blank" or similar
      if (link.target && link.target !== '_self') return;
      
      // Skip if it's a mailto:, tel:, or other protocol link
      if (href.startsWith('mailto:') || href.startsWith('tel:') || href.includes(':')) return;

      // For internal links, instantly scroll to top after navigation
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    };

    // Add event listener with capture phase to catch all link clicks
    document.addEventListener('click', handleLinkClick, true);

    // Cleanup function
    return () => {
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, []);

  // Utility for programmatic instant scrolling
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  return { scrollToTop };
};

/**
 * Cross-browser compatible instant scroll to top function
 */
export const instantScrollToTop = () => {
  // Multiple approaches to ensure it works across all browsers
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  
  // For some edge cases with mobile browsers
  if (window.pageYOffset !== 0) {
    document.documentElement.scrollTop = 0;
  }
};