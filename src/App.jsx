import React, { useEffect } from 'react';
import { Provider, useAtom, useAtomValue } from 'jotai';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

import {
    loadingAtom,
    petriNetNodesAtom,
    petriNetEdgesAtom,
    showClickHelpAtom
} from './atoms';

import ControlPanel from './components/ControlPanel';
import StatusPanel from './components/StatusPanel';
import PetriNetFlow from './components/PetriNetFlow';
import LoadingSpinner from './components/LoadingSpinner';

import { useLayout } from './hooks/useLayout';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTransitionFiring } from './hooks/useTransitionFiring';

import 'reactflow/dist/style.css';

const AppContent = () => {
    const [loading, setLoading] = useAtom(loadingAtom);
    const petriNetNodes = useAtomValue(petriNetNodesAtom);
    const petriNetEdges = useAtomValue(petriNetEdgesAtom);
    const setShowClickHelp = useAtom(showClickHelpAtom)[1];

    const { applyELKLayout } = useLayout();
    const { handleNext } = useTransitionFiring();

    useKeyboardShortcuts(handleNext, setShowClickHelp);

    useEffect(() => {
        console.log('Initializing from JSON data...');

        applyELKLayout().then(() => {
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, [applyELKLayout, setLoading]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: '#f7fafc'
        }}>
            <ControlPanel />

            <div style={{
                flex: 1,
                display: 'flex',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <PetriNetFlow
                    nodes={petriNetNodes}
                    edges={petriNetEdges}
                />
            </div>

            <StatusPanel />

            <style>
                {`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    15% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    85% { opacity: 1; transform: translateX(-50%) translateY(0); }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                }
                
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
                
                button {
                    transition: all 0.2s ease;
                }
                
                button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.2);
                }
                
                .react-flow__edge-path {
                    stroke-width: 1.5 !important;
                }
                
                .react-flow__edge.selected .react-flow__edge-path {
                    stroke-width: 2 !important;
                }
                
                .react-flow__node[data-type="transition"] {
                    border-radius: 6px !important;
                    font-size: 12px !important;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    transition: all 0.3s ease !important;
                }
                
                .react-flow__node[data-type="place"] {
                    border-radius: 50% !important;
                    min-width: 100px !important;
                    min-height: 100px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
                
                .react-flow__node:hover {
                    filter: brightness(1.05) !important;
                }
                `}
            </style>
        </div>
    );
};

export default function App() {
    return (
        <Provider>
            <ReactFlowProvider>
                <AppContent />
            </ReactFlowProvider>
        </Provider>
    );
}