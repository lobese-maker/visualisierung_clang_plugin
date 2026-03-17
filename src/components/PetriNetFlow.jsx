import React, { useMemo } from 'react';
import ReactFlow, {
    Controls,
    Background,
    MarkerType,
} from 'reactflow';
import { useAtom, useAtomValue } from 'jotai';
import {
    petriNetNodesAtom,
    petriNetEdgesAtom,
    autoLayoutAtom,
    firingTransitionAtom,
} from '../atoms';
import { useTransitionFiring } from '../hooks/useTransitionFiring';
import PetriNetNode from './PetriNetNode';
import StatusIndicator from './StatusIndicator';
import ClickHelpMessage from './ClickHelpMessage';
import 'reactflow/dist/style.css';

const nodeTypes = {
    petriPlace: PetriNetNode,
    petriTransition: PetriNetNode,
};

const PetriNetFlow = ({ nodes, edges }) => {
    const [petriNetNodes, setPetriNetNodes] = useAtom(petriNetNodesAtom);
    const [petriNetEdges, setPetriNetEdges] = useAtom(petriNetEdgesAtom);
    const autoLayout = useAtomValue(autoLayoutAtom);
    const firingTransition = useAtomValue(firingTransitionAtom);

    const { handleNodeClick, handleEdgeClick, onNodesChange, onEdgesChange, onConnect } = useTransitionFiring();

    // Animate edges based on current path
    const animatedEdges = useMemo(() => {
        return edges.map(edge => {
            let isFiringEdge = false;

            if (firingTransition) {
                isFiringEdge = edge.target === firingTransition || edge.source === firingTransition;
            }

            return {
                ...edge,
                type: 'smoothstep',
                animated: isFiringEdge,
                style: {
                    stroke: isFiringEdge ? '#ff9800' : '#888',
                    strokeWidth: isFiringEdge ? 3 : 1.5,
                    opacity: isFiringEdge ? 1 : 0.6,
                    transition: 'all 0.3s ease'
                },
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: isFiringEdge ? '#ff9800' : '#888',
                    width: isFiringEdge ? 20 : 15,
                    height: isFiringEdge ? 20 : 15,
                }
            };
        });
    }, [edges, firingTransition]);

    return (
        <div style={{
            flex: 1,
            position: 'relative',
            background: '#fafafa',
            minHeight: 0
        }}>
            <StatusIndicator />
            <ClickHelpMessage />

            <ReactFlow
                nodes={nodes}
                edges={animatedEdges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
                fitView={autoLayout}
                fitViewOptions={{
                    padding: 0.4,
                    minZoom: 0.5,
                    maxZoom: 1.5
                }}
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={true}
                proOptions={{ hideAttribution: true }}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    style: { strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed }
                }}
                selectNodesOnDrag={false}
                panOnDrag={[1, 2]}
                panOnScroll={true}
                zoomOnScroll={true}
                zoomOnPinch={true}
                zoomOnDoubleClick={true}
                minZoom={0.2}
                maxZoom={2}
            >
                <Controls
                    style={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        borderRadius: '6px'
                    }}
                />
                <Background variant="dots" gap={25} size={1} color="#e8e8e8" />
            </ReactFlow>
        </div>
    );
};

export default PetriNetFlow;