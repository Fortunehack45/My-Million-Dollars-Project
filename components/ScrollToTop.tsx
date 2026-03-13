import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * ScrollToTop component is effectively disabled since Framer Motion's
 * <AnimatePresence onExitComplete> now cleanly handles scroll resetting
 * *after* the outgoing page transition finishes.
 */
const ScrollToTop = () => {
    // Scroll restoration is natively handled by App.tsx <AnimatePresence onExitComplete>
    return null;
};

export default ScrollToTop;
