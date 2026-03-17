import { atom } from 'jotai';

export const loadingAtom = atom(true);
export const firingTransitionAtom = atom(null);
export const fireAnimationAtom = atom(false);
export const autoLayoutAtom = atom(true);
export const showClickHelpAtom = atom(false);
export const lastClickedTransitionAtom = atom(null);
export const elkAvailableAtom = atom(true);