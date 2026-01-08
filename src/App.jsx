// App.jsx - WITH DAGRE LAYOUT (ES MODULES)
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import PetriNetNode from './PetriNetNode';
import StateGraphNode from './StateGraphNode';

// ALL places from your state graph
const ALL_PLACES = ['Start', 'End', 'MessageBuffer', 'P0', 'P1', 'Signals'];
const ALL_TRANSITIONS = ['MPI_Init0', 'MPI_Finalize1'];

// State graph data
const stateGraphStates = [
    {
        id: '0',
        marking: {
            Start: ['InitMarker()'],
            End: [],
            MessageBuffer: [],
            P0: [],
            P1: [],
            Signals: [],
        },
        firedTransitions: [],
    },
    {
        id: '1',
        marking: {
            Start: [],
            End: [],
            MessageBuffer: [],
            P0: ['FinalizeMarker()'],
            P1: ['FinalizeMarker()'],
            Signals: [],
        },
        firedTransitions: [{ transition: 'MPI_Init0', count: 1 }],
    },
    {
        id: '2',
        marking: {
            Start: [],
            End: ['FinalizeMarker()'],
            MessageBuffer: [],
            P0: [],
            P1: [],
            Signals: [],
        },
        firedTransitions: [
            { transition: 'MPI_Init0', count: 1 },
            { transition: 'MPI_Finalize1', count: 1 }
        ],
    }
];

const stateGraphEdges = [
    { id: 'edge-0-1', source: '0', target: '1', label: 'Step' },
    { id: 'edge-1-2', source: '1', target: '2', label: 'Step' },
];

// Create initial petri net nodes
const createInitialPetriNetNodes = () => {
    const nodes = [];

    // Add all places
    ALL_PLACES.forEach((placeId, index) => {
        nodes.push({
            id: placeId,
            type: 'petriPlace',
            position: { x: 50, y: 50 + index * 80 },
            data: {
                type: 'place',
                id: placeId,
                label: placeId
            },
            draggable: true,
        });
    });

    // Add all transitions
    ALL_TRANSITIONS.forEach((transId, index) => {
        nodes.push({
            id: transId,
            type: 'petriTransition',
            position: { x: 250, y: 100 + index * 120 },
            data: {
                type: 'transition',
                id: transId,
                label: transId
            },
            draggable: true,
        });
    });

    return nodes;
};

// Create petri net edges
const createPetriNetEdges = () => [
    { id: 'e-start-init', source: 'Start', target: 'MPI_Init0', label: 'i' },
    { id: 'e-init-p0', source: 'MPI_Init0', target: 'P0', label: 'FinalizeMarker()' },
    { id: 'e-init-p1', source: 'MPI_Init0', target: 'P1', label: 'FinalizeMarker()' },
    { id: 'e-p0-finalize', source: 'P0', target: 'MPI_Finalize1', label: 'f0' },
    { id: 'e-p1-finalize', source: 'P1', target: 'MPI_Finalize1', label: 'f1' },
    { id: 'e-finalize-end', source: 'MPI_Finalize1', target: 'End', label: 'FinalizeMarker()' }
];

// Convert state graph to ReactFlow nodes
const initialStateGraphNodes = stateGraphStates.map((state, index) => ({
    id: state.id,
    type: 'stateGraph',
    position: { x: index * 220, y: 100 },
    data: {
        stateId: state.id,
        marking: state.marking,
        firedTransitions: state.firedTransitions,
    },
    draggable: true,
}));

// Simple manual layout function (no dagre dependency)
const applySimpleLayout = (nodes, direction = 'vertical') => {
    console.log('Applying simple layout:', direction);

    const layoutedNodes = nodes.map((node, index) => {
        if (direction === 'vertical') {
            // Vertical layout
            if (node.data.type === 'place') {
                return {
                    ...node,
                    position: { x: 100, y: 50 + index * 100 }
                };
            } else {
                return {
                    ...node,
                    position: { x: 300, y: 100 + (index - ALL_PLACES.length) * 150 }
                };
            }
        } else {
            // Horizontal layout
            if (node.data.type === 'place') {
                return {
                    ...node,
                    position: { x: 50 + index * 120, y: 100 }
                };
            } else {
                return {
                    ...node,
                    position: { x: 150 + (index - ALL_PLACES.length) * 200, y: 300 }
                };
            }
        }
    });

    return layoutedNodes;
};

export default function App() {
    const [currentStateIndex, setCurrentStateIndex] = useState(0);
    const [showPetriNet, setShowPetriNet] = useState(true);
    const [showStateGraph, setShowStateGraph] = useState(true);
    const [nodes, setNodes] = useState(createInitialPetriNetNodes());
    const [edges, setEdges] = useState(createPetriNetEdges());
    const [debugLog, setDebugLog] = useState([]);
    const [layoutDirection, setLayoutDirection] = useState('vertical');

    // Add debug message
    const addDebug = (message, data = null) => {
        console.log(`🔍 ${message}`, data);
        setDebugLog(prev => [
            { timestamp: new Date().toLocaleTimeString(), message, data: data ? JSON.stringify(data).slice(0, 100) : null },
            ...prev.slice(0, 9)
        ]);
    };

    // Initialize debugging
    useEffect(() => {
        addDebug('App mounted');
        addDebug('All places:', ALL_PLACES);
        addDebug('All transitions:', ALL_TRANSITIONS);
        addDebug('Initial nodes:', nodes);
    }, []);

    // Node types
    const petriNetNodeTypes = useMemo(() => ({
        petriPlace: PetriNetNode,
        petriTransition: PetriNetNode,
        default: PetriNetNode,
    }), []);

    const stateGraphNodeTypes = useMemo(() => ({
        stateGraph: StateGraphNode,
    }), []);

    // Get current state
    const currentState = useMemo(() => {
        const state = stateGraphStates[currentStateIndex] || stateGraphStates[0];
        return state;
    }, [currentStateIndex]);

    // Which transitions are currently firing
    const currentlyFiringTransitions = useMemo(() => {
        const nextState = stateGraphStates[currentStateIndex + 1];
        if (!nextState) return [];

        return nextState.firedTransitions
            .filter(ft =>
                !currentState.firedTransitions.some(t => t.transition === ft.transition)
            )
            .map(ft => ft.transition);
    }, [currentStateIndex, currentState]);

    // Update petri net nodes with current state
    const petriNetNodesWithState = useMemo(() => {
        return nodes.map(node => {
            const tokensForThisNode = currentState.marking[node.id] || [];
            const isFiring = currentlyFiringTransitions.includes(node.id);

            return {
                ...node,
                data: {
                    ...node.data,
                    tokens: tokensForThisNode,
                    firing: isFiring,
                }
            };
        });
    }, [nodes, currentState, currentlyFiringTransitions]);

    // State graph nodes
    const stateGraphNodesWithCurrent = useMemo(() =>
            initialStateGraphNodes.map(node => ({
                ...node,
                data: {
                    ...node.data,
                    isCurrent: node.id === currentStateIndex.toString()
                }
            }))
        , [currentStateIndex]);

    // Event handlers for movable nodes
    const onPetriNetNodesChange = useCallback(
        (changes) => {
            setNodes((nds) => applyNodeChanges(changes, nds));
        },
        []
    );

    const onPetriNetEdgesChange = useCallback(
        (changes) => {
            setEdges((eds) => applyEdgeChanges(changes, eds));
        },
        []
    );

    const onPetriNetConnect = useCallback(
        (params) => {
            setEdges((eds) => addEdge(params, eds));
        },
        []
    );

    const onStateGraphNodesChange = useCallback(
        (changes) => {
            // We could track state graph node positions if needed
        },
        []
    );

    const onStateGraphEdgesChange = useCallback(
        (changes) => {
        },
        []
    );

    const onStateGraphConnect = useCallback(
        (params) => {
        },
        []
    );

    // Button handlers
    const handlePrevious = () => {
        const newIndex = Math.max(0, currentStateIndex - 1);
        setCurrentStateIndex(newIndex);
    };

    const handleNext = () => {
        const newIndex = Math.min(stateGraphStates.length - 1, currentStateIndex + 1);
        setCurrentStateIndex(newIndex);
    };

    const handleReset = () => {
        setCurrentStateIndex(0);
    };

    // Apply layout
    const applyLayout = useCallback((direction = 'vertical') => {
        addDebug(`Applying ${direction} layout`);

        const layoutedNodes = applySimpleLayout(nodes, direction);

        setNodes(layoutedNodes);
        setLayoutDirection(direction);
    }, [nodes]);

    // Auto-apply layout on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            applyLayout('vertical');
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Control Panel */}
            <div style={{
                background: '#f7fafc',
                padding: '10px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Petri Net Simulator</h3>
                    <button
                        onClick={() => {
                            setShowPetriNet(!showPetriNet);
                        }}
                        style={{
                            background: showPetriNet ? '#4299e1' : '#e2e8f0',
                            color: showPetriNet ? 'white' : '#4a5568',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        {showPetriNet ? 'Hide Petri Net' : 'Show Petri Net'}
                    </button>
                    <button
                        onClick={() => {
                            setShowStateGraph(!showStateGraph);
                        }}
                        style={{
                            background: showStateGraph ? '#48bb78' : '#e2e8f0',
                            color: showStateGraph ? 'white' : '#4a5568',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        {showStateGraph ? 'Hide State Graph' : 'Show State Graph'}
                    </button>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                            onClick={() => applyLayout('vertical')}
                            style={{
                                background: layoutDirection === 'vertical' ? '#9f7aea' : '#e2e8f0',
                                color: layoutDirection === 'vertical' ? 'white' : '#4a5568',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Vertical
                        </button>
                        <button
                            onClick={() => applyLayout('horizontal')}
                            style={{
                                background: layoutDirection === 'horizontal' ? '#9f7aea' : '#e2e8f0',
                                color: layoutDirection === 'horizontal' ? 'white' : '#4a5568',
                                border: 'none',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Horizontal
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>Current State: {currentStateIndex}</span>
                    <button
                        onClick={handlePrevious}
                        disabled={currentStateIndex === 0}
                        style={{
                            background: currentStateIndex === 0 ? '#e2e8f0' : '#4299e1',
                            color: currentStateIndex === 0 ? '#a0aec0' : 'white',
                            border: 'none',
                            padding: '5px 15px',
                            borderRadius: '4px',
                            cursor: currentStateIndex === 0 ? 'not-allowed' : 'pointer',
                        }}
                    >
                        ← Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentStateIndex === stateGraphStates.length - 1}
                        style={{
                            background: currentStateIndex === stateGraphStates.length - 1 ? '#e2e8f0' : '#48bb78',
                            color: currentStateIndex === stateGraphStates.length - 1 ? '#a0aec0' : 'white',
                            border: 'none',
                            padding: '5px 15px',
                            borderRadius: '4px',
                            cursor: currentStateIndex === stateGraphStates.length - 1 ? 'not-allowed' : 'pointer',
                        }}
                    >
                        Next →
                    </button>
                    <button
                        onClick={handleReset}
                        style={{
                            background: '#f56565',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Petri Net Visualization */}
                {showPetriNet && (
                    <div style={{ flex: 1, borderRight: '1px solid #e2e8f0', position: 'relative' }}>
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: 'rgba(255,255,255,0.9)',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            zIndex: 10,
                            fontSize: '12px',
                            fontWeight: 'bold',
                            border: '1px solid #e2e8f0',
                        }}>
                            Petri Net • Layout: {layoutDirection}
                        </div>
                        <ReactFlow
                            nodes={petriNetNodesWithState}
                            edges={edges}
                            nodeTypes={petriNetNodeTypes}
                            onNodesChange={onPetriNetNodesChange}
                            onEdgesChange={onPetriNetEdgesChange}
                            onConnect={onPetriNetConnect}
                            fitView
                            fitViewOptions={{ padding: 0.2 }}
                            nodesDraggable={true}
                            elementsSelectable={true}
                            connectionMode="loose"
                        >
                            <Controls />
                            <Background variant="dots" gap={20} size={0.5} />
                        </ReactFlow>
                    </div>
                )}

                {/* State Graph */}
                {showStateGraph && (
                    <div style={{ flex: 1, position: 'relative' }}>
                        <div style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: 'rgba(255,255,255,0.9)',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            zIndex: 10,
                            fontSize: '12px',
                            fontWeight: 'bold',
                            border: '1px solid #e2e8f0',
                        }}>
                            State Graph (Current: State {currentStateIndex})
                        </div>
                        <ReactFlow
                            nodes={stateGraphNodesWithCurrent}
                            edges={stateGraphEdges}
                            nodeTypes={stateGraphNodeTypes}
                            onNodesChange={onStateGraphNodesChange}
                            onEdgesChange={onStateGraphEdgesChange}
                            onConnect={onStateGraphConnect}
                            fitView
                            fitViewOptions={{ padding: 0.2 }}
                            nodesDraggable={true}
                            elementsSelectable={true}
                        >
                            <Controls />
                            <Background variant="lines" gap={50} size={1} />
                        </ReactFlow>
                    </div>
                )}
            </div>

            {/* Status Panel */}
            <div style={{
                background: '#f7fafc',
                padding: '10px',
                borderTop: '1px solid #e2e8f0',
                maxHeight: '150px',
                overflow: 'auto',
                fontSize: '12px',
            }}>
                <h4 style={{ margin: '0 0 10px 0' }}>Current State {currentStateIndex}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <div>
                        <strong>All Places:</strong>
                        {ALL_PLACES.map(place => {
                            const tokens = currentState.marking[place] || [];
                            return (
                                <div key={place} style={{
                                    margin: '2px 0',
                                    padding: '3px',
                                    background: tokens.length > 0 ? '#c6f6d5' : '#edf2f7',
                                    borderRadius: '3px',
                                }}>
                                    <span style={{ fontWeight: 'bold' }}>{place}:</span>
                                    <span style={{ marginLeft: '5px', color: tokens.length > 0 ? '#22543d' : '#718096' }}>
                                        {tokens.length > 0 ? tokens.join(', ') : 'empty'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div>
                        <strong>Fired Transitions:</strong>
                        {currentState.firedTransitions.length > 0 ? (
                            currentState.firedTransitions.map(ft => (
                                <div key={ft.transition} style={{
                                    margin: '2px 0',
                                    padding: '3px',
                                    background: '#bee3f8',
                                    borderRadius: '3px',
                                }}>
                                    {ft.transition}: {ft.count} time{ft.count > 1 ? 's' : ''}
                                </div>
                            ))
                        ) : (
                            <div style={{ color: '#718096' }}>None</div>
                        )}
                    </div>
                    <div>
                        <strong>Current Action:</strong>
                        {currentlyFiringTransitions.length > 0 ? (
                            currentlyFiringTransitions.map(trans => (
                                <div key={trans} style={{
                                    margin: '2px 0',
                                    padding: '3px',
                                    background: '#fed7d7',
                                    color: '#c53030',
                                    borderRadius: '3px',
                                    fontWeight: 'bold',
                                    animation: 'pulse 1s infinite',
                                }}>
                                    ⚡ {trans} is firing
                                </div>
                            ))
                        ) : (
                            <div style={{ color: '#718096' }}>
                                {currentStateIndex === stateGraphStates.length - 1
                                    ? '✅ Simulation Complete'
                                    : '⏸️ Ready for next transition'}
                            </div>
                        )}
                        <div style={{ marginTop: '10px', fontSize: '11px', color: '#718096' }}>
                            <strong>Layout:</strong> Use Vertical or Horizontal buttons
                        </div>
                    </div>
                </div>
            </div>

            {/* Add pulse animation */}
            <style>
                {`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
                
                button {
                    transition: all 0.2s ease;
                }
                
                button:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                `}
            </style>
        </div>
    );
}