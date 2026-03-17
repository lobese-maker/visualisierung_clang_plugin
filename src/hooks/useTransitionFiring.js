import { useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
    currentStateIdAtom,
    historyAtom,
    selectedPathsAtom,
    firingTransitionAtom,
    fireAnimationAtom,
    lastClickedTransitionAtom,
    showClickHelpAtom,
    transitionMapAtom,
    branchingPointsAtom,
    isProcessingAtom
} from '../atoms';

export const useTransitionFiring = () => {
    const [currentStateId, setCurrentStateId] = useAtom(currentStateIdAtom);
    const [history, setHistory] = useAtom(historyAtom);
    const [selectedPaths, setSelectedPaths] = useAtom(selectedPathsAtom);
    const [firingTransition, setFiringTransition] = useAtom(firingTransitionAtom);
    const [fireAnimation, setFireAnimation] = useAtom(fireAnimationAtom);
    const [lastClickedTransition, setLastClickedTransition] = useAtom(lastClickedTransitionAtom);
    const setShowClickHelp = useSetAtom(showClickHelpAtom);
    const transitionMap = useAtomValue(transitionMapAtom);
    const branchingPoints = useAtomValue(branchingPointsAtom);
    const isProcessing = useAtomValue(isProcessingAtom);

    const navigateToState = useCallback((stateId) => {
        setCurrentStateId(stateId);
        setHistory(prev => [...prev, stateId]);
    }, [setCurrentStateId, setHistory]);

    const handleTransitionClick = useCallback((transitionId) => {
        console.log(`Transition ${transitionId} clicked for firing from state ${currentStateId}`);

        if (isProcessing) {
            console.log('Already processing a transition, ignoring click');
            return;
        }

        const transitionMapForState = transitionMap[currentStateId];
        if (!transitionMapForState) {
            console.log(`No transition map for state ${currentStateId}`);
            setShowClickHelp(true);
            setTimeout(() => setShowClickHelp(false), 2000);
            return;
        }

        const targetStateId = transitionMapForState[transitionId];
        if (!targetStateId) {
            console.log(`Transition ${transitionId} not available from current state`);
            setShowClickHelp(true);
            setTimeout(() => setShowClickHelp(false), 2000);
            return;
        }

        setLastClickedTransition(transitionId);
        setFiringTransition(transitionId);
        setFireAnimation(true);

        if (branchingPoints.includes(currentStateId)) {
            setSelectedPaths(prev => ({
                ...prev,
                [currentStateId]: targetStateId
            }));
        }

        setTimeout(() => {
            navigateToState(targetStateId);
            setTimeout(() => {
                setFireAnimation(false);
                setFiringTransition(null);
                setLastClickedTransition(null);
            }, 300);
        }, 600);
    }, [currentStateId, isProcessing, transitionMap, branchingPoints,
        setShowClickHelp, setLastClickedTransition, setFiringTransition,
        setFireAnimation, setSelectedPaths, navigateToState]);

    const handleNodeClick = useCallback((event, node) => {
        console.log('Node clicked:', node.id, 'Type:', node.data.type, 'Is clickable:', node.data.isClickable);

        if (node.data.type !== 'transition') {
            return;
        }

        if (!node.data.isClickable) {
            console.log(`Transition ${node.id} is not clickable (not available)`);
            setShowClickHelp(true);
            setTimeout(() => setShowClickHelp(false), 2000);
            return;
        }

        const isCtrlPressed = event.ctrlKey || event.metaKey;

        if (isCtrlPressed) {
            event.preventDefault();
            event.stopPropagation();
            console.log(`Ctrl+Click detected on transition ${node.id}`);
            handleTransitionClick(node.id);
        } else {
            console.log(`Click on ${node.id} without Ctrl key`);
            setShowClickHelp(true);
            setTimeout(() => setShowClickHelp(false), 2000);
        }
    }, [handleTransitionClick, setShowClickHelp]);

    const handleNext = useCallback(() => {
        const transitionMapForState = transitionMap[currentStateId];
        if (!transitionMapForState) return;

        const available = Object.keys(transitionMapForState);
        if (available.length === 0) return;

        if (available.length > 1) {
            console.log('Multiple transitions available. Ctrl+Click one to choose path.');
            setShowClickHelp(true);
            setTimeout(() => setShowClickHelp(false), 3000);
        } else {
            handleTransitionClick(available[0]);
        }
    }, [currentStateId, transitionMap, handleTransitionClick, setShowClickHelp]);

    const handlePrevious = useCallback(() => {
        if (history.length > 1) {
            const newHistory = [...history];
            newHistory.pop();
            const prevState = newHistory[newHistory.length - 1];

            setHistory(newHistory);
            setCurrentStateId(prevState);

            if (branchingPoints.includes(prevState)) {
                setSelectedPaths(prev => {
                    const newPaths = { ...prev };
                    delete newPaths[prevState];
                    return newPaths;
                });
            }
        }
    }, [history, setHistory, setCurrentStateId, branchingPoints, setSelectedPaths]);

    const handleReset = useCallback(() => {
        setCurrentStateId(stateGraph.metadata?.initialState || "0");
        setSelectedPaths({});
        setShowClickHelp(false);
        setHistory([stateGraph.metadata?.initialState || "0"]);
        setFiringTransition(null);
        setFireAnimation(false);
        setLastClickedTransition(null);
    }, [setCurrentStateId, setSelectedPaths, setShowClickHelp,
        setHistory, setFiringTransition, setFireAnimation, setLastClickedTransition]);

    return {
        handleTransitionClick,
        handleNodeClick,
        handleNext,
        handlePrevious,
        handleReset,
        navigateToState,
        setShowClickHelp
    };
};