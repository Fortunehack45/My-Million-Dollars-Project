import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * ScrollToTop component ensures that navigating between pages
 * resets the scroll position to the top of the viewport.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant' as ScrollBehavior, // Use instant for clean transitions during page loads
        });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
