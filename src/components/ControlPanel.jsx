import React from 'react';
import { useAtom, useAtomValue } from 'jotai';
import {
    autoLayoutAtom,
    elkAvailableAtom,
    currentStateIdAtom,
    firingTransitionAtom,
    fireAnimationAtom,
    lastClickedTransitionAtom,
    isAtBranchingPointAtom,
    isAtFinalStateAtom,
    availableTransitionsAtom,
    isProcessingAtom
} from '../atoms';
import { useTransitionFiring } from '../hooks/useTransitionFiring';
import { useLayout } from '../hooks/useLayout';

const ControlPanel = () => {
    const [autoLayout, setAutoLayout] = useAtom(autoLayoutAtom);
    const elkAvailable = useAtomValue(elkAvailableAtom);
    const currentStateId = useAtomValue(currentStateIdAtom);
    const firingTransition = useAtomValue(firingTransitionAtom);
    const fireAnimation = useAtomValue(fireAnimationAtom);
    const lastClickedTransition = useAtomValue(lastClickedTransitionAtom);
    const isAtBranchingPoint = useAtomValue(isAtBranchingPointAtom);
    const isAtFinalState = useAtomValue(isAtFinalStateAtom);
    const availableTransitions = useAtomValue(availableTransitionsAtom);
    const isProcessing = useAtomValue(isProcessingAtom);

    const { handleNext, handlePrevious, handleReset } = useTransitionFiring();
    const { applyELKLayout } = useLayout();

    const getStateColor = () => {
        if (isAtBranchingPoint) return '#9c27b0';
        if (isAtFinalState) return '#4caf50';
        return '#2196f3';
    };

    return (
        <div style={{
            background: 'white',
            padding: '12px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#2d3748' }}>Petri Net Simulator</h3>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setAutoLayout(!autoLayout)}
                        style={{
                            background: autoLayout ? '#4caf50' : '#ff9800',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px'
                        }}
                    >
                        {autoLayout ? 'Auto-Layout ON' : 'Auto-Layout OFF'}
                    </button>

                    {autoLayout && (
                        <button
                            onClick={applyELKLayout}
                            style={{
                                background: '#2196f3',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '14px'
                            }}
                        >
                            {elkAvailable ? 'Reapply ELK Layout' : 'Reapply Layout'}
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                    background: getStateColor(),
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontWeight: '600',
                    color: 'white',
                    fontSize: '14px',
                }}>
                    <span>State: {currentStateId}</span>
                    {fireAnimation && (
                        <span style={{
                            marginLeft: '10px',
                            background: '#ff9800',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            animation: 'pulse 1s infinite'
                        }}>
                            ⚡ {firingTransition}
                        </span>
                    )}
                    {lastClickedTransition && !fireAnimation && (
                        <span style={{
                            marginLeft: '10px',
                            background: '#1976d2',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}>
                            ↪ {lastClickedTransition}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        onClick={handlePrevious}
                        disabled={history.length <= 1 || isProcessing}
                        style={{
                            background: history.length <= 1 || isProcessing ? '#e2e8f0' : '#757575',
                            color: history.length <= 1 || isProcessing ? '#a0aec0' : 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: history.length <= 1 || isProcessing ? 'not-allowed' : 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            minWidth: '100px'
                        }}
                    >
                        ← Back
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={availableTransitions.length === 0 || isProcessing}
                        style={{
                            background: isProcessing ? '#ff9800' :
                                availableTransitions.length === 0 ? '#e2e8f0' :
                                    isAtBranchingPoint ? '#9c27b0' : '#4caf50',
                            color: isProcessing || availableTransitions.length === 0 ? '#a0aec0' : 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: availableTransitions.length === 0 || isProcessing ? 'not-allowed' : 'pointer',
                            fontWeight: '500',
                            fontSize: '14px',
                            minWidth: '140px'
                        }}
                    >
                        {isProcessing ? 'Processing...' :
                            availableTransitions.length > 1 ? 'Choose Transition ↓' :
                                isAtBranchingPoint ? 'Choose Path →' : 'Next →'}
                    </button>

                    <button
                        onClick={handleReset}
                        disabled={isProcessing}
                        style={{
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            fontWeight: '500',
                            fontSize: '14px'
                        }}
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;