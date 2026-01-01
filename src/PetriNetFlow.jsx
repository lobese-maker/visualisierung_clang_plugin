import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [
    { id: 'p1', type: 'default', position: { x: 100, y: 100 }, data: { label: 'Place 1', tokens: 1 } },
    { id: 'p2', type: 'default', position: { x: 400, y: 100 }, data: { label: 'Place 2', tokens: 0 } },
    { id: 't1', type: 'default', position: { x: 250, y: 100 }, data: { label: 'Transition' } },
];

const initialEdges = [
    { id: 'p1-t1', source: 'p1', target: 't1', animated: true },
    { id: 't1-p2', source: 't1', target: 'p2', animated: true },
];

export default function PetriNetFlow() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    const onNodesChange = useCallback(
        (changes) => setNodes((ns) => applyNodeChanges(changes, ns)),
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

    // Fire transition t1: move 1 token from p1 -> p2
    const fireTransition = () => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === 'p1' && node.data.tokens > 0) {
                    return { ...node, data: { ...node.data, tokens: node.data.tokens - 1 } };
                } else if (node.id === 'p2') {
                    return { ...node, data: { ...node.data, tokens: node.data.tokens + 1 } };
                }
                return node;
            })
        );
    };

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <button onClick={fireTransition} style={{ position: 'absolute', zIndex: 10, top: 10, left: 10 }}>
                Fire Transition
            </button>
            <ReactFlow
                nodes={nodes.map((node) => ({
                    ...node,
                    data: { ...node.data, label: `${node.data.label} (${node.data.tokens ?? ''})` },
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