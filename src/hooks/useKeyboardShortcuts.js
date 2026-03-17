import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { fireAnimationAtom, showClickHelpAtom } from '../atoms';

export const useKeyboardShortcuts = (handleNext) => {
    const fireAnimation = useAtomValue(fireAnimationAtom);
    const setShowClickHelp = useSetAtom(showClickHelpAtom);
    const showClickHelp = useAtomValue(showClickHelpAtom);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.code === 'Space' && !fireAnimation) {
                event.preventDefault();
                handleNext();
            }

            if (event.code === 'Escape' && showClickHelp) {
                setShowClickHelp(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, fireAnimation, showClickHelp, setShowClickHelp]);
};