import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Initial Petri net setup
const initialNodes = [
    { id: 'p1', type: 'default', position: { x: 100, y: 100 }, data: { label: 'Place 1', tokens: 2 } },
    { id: 'p2', type: 'default', position: { x: 400, y: 100 }, data: { label: 'Place 2', tokens: 0 } },
    { id: 'p3', type: 'default', position: { x: 400, y: 250 }, data: { label: 'Place 3', tokens: 1 } },
    { id: 't1', type: 'default', position: { x: 250, y: 100 }, data: { label: 'Transition 1', heldTokens: 0 } },
    { id: 't2', type: 'default', position: { x: 250, y: 250 }, data: { label: 'Transition 2', heldTokens: 0 } },
];

const initialEdges = [
    { id: 'p1-t1', source: 'p1', target: 't1', animated: true },
    { id: 't1-p2', source: 't1', target: 'p2', animated: true },
    { id: 'p3-t2', source: 'p3', target: 't2', animated: true },
    { id: 't2-p2', source: 't2', target: 'p2', animated: true },
];

export default function PetriNetMult() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((es) => applyEdgeChanges(changes, es)),
        []
    );
    const onConnect = useCallback(
        (params) => setEdges((es) => addEdge(params, es)),
        []
    );

    // Fire all transitions: move tokens from places to transitions
    const fireTransitions = () => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id.startsWith('t')) {
                    // Transition: collect tokens from incoming places
                    const incoming = edges.filter((e) => e.target === node.id);
                    let collected = 0;
                    incoming.forEach((edge) => {
                        const place = nds.find((n) => n.id === edge.source);
                        if (place && place.data.tokens > 0) {
                            collected += 1;
                            place.data.tokens -= 1; // remove one token
                        }
                    });
                    return { ...node, data: { ...node.data, heldTokens: (node.data.heldTokens || 0) + collected } };
                }
                return node;
            })
        );
    };

    // Move tokens from transitions to outgoing places
    const moveTokensToPlaces = () => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id.startsWith('t') && node.data.heldTokens > 0) {
                    const outgoing = edges.filter((e) => e.source === node.id);
                    const totalTokens = node.data.heldTokens;

                    outgoing.forEach((edge) => {
                        const place = nds.find((n) => n.id === edge.target);
                        if (place) {
                            place.data.tokens += totalTokens; // each token is moved once per edge
                        }
                    });

                    return { ...node, data: { ...node.data, heldTokens: 0 } }; // reset transition tokens
                }
                return node;
            })
        );
    };

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <div style={{ position: 'absolute', zIndex: 10, top: 10, left: 10 }}>
                <button onClick={fireTransitions} style={{ marginRight: 10 }}>
                    Fire Transitions
                </button>
                <button onClick={moveTokensToPlaces}>
                    Move Tokens to Places
                </button>
            </div>
            <ReactFlow
                nodes={nodes.map((node) => ({
                    ...node,
                    data: {
                        ...node.data,
                        label:
                            node.id.startsWith('p')
                                ? `${node.data.label} (${node.data.tokens})`
                                : `${node.data.label} [${node.data.heldTokens}]`,
                    },
                }))}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            />
        </div>
    );
}
