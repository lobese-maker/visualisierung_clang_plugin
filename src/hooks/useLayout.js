import { useCallback } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import {
    petriNetNodesAtom,
    petriNetEdgesAtom,
    rawPetriNetNodesAtom,
    rawPetriNetEdgesAtom,
    elkAvailableAtom,
    autoLayoutAtom
} from '../atoms';
import { getELK, createELKGraph } from '../utils/elkLayout';
import { parseHtmlLabel } from '../utils/htmlParser';
import { MarkerType } from 'reactflow';

export const useLayout = () => {
    const setPetriNetNodes = useSetAtom(petriNetNodesAtom);
    const setPetriNetEdges = useSetAtom(petriNetEdgesAtom);
    const setElkAvailable = useSetAtom(elkAvailableAtom);
    const autoLayout = useAtomValue(autoLayoutAtom);
    const rawNodes = useAtomValue(rawPetriNetNodesAtom);
    const rawEdges = useAtomValue(rawPetriNetEdgesAtom);

    const applyManualLayout = useCallback(() => {
        console.log('Applying manual layout...');

        const nodes = rawNodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                isClickable: false,
                parsedLabel: parseHtmlLabel(node.data.htmlLabel) || node.data.label,
                rawHtmlLabel: node.data.htmlLabel
            }
        }));

        const edges = rawEdges.map(edge => ({
            ...edge,
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#b1b1b7',
                width: 15,
                height: 15,
            }
        }));

        setPetriNetNodes(nodes);
        setPetriNetEdges(edges);
    }, [rawNodes, rawEdges, setPetriNetNodes, setPetriNetEdges]);

    const applyELKLayout = useCallback(async () => {
        console.log('Applying ELK.js layout...');

        try {
            const elk = await getELK();
            const elkGraph = createELKGraph(rawNodes, rawEdges);
            const layout = await elk.layout(elkGraph);

            if (layout && layout.children) {
                const positionedNodes = rawNodes.map(node => {
                    const elkNode = layout.children.find(n => n.id === node.id);
                    const position = elkNode ? { x: elkNode.x, y: elkNode.y } : node.position;

                    return {
                        ...node,
                        position,
                        data: {
                            ...node.data,
                            isClickable: false,
                            parsedLabel: parseHtmlLabel(node.data.htmlLabel) || node.data.label,
                            rawHtmlLabel: node.data.htmlLabel
                        }
                    };
                });

                const edges = rawEdges.map(edge => ({
                    ...edge,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#b1b1b7',
                        width: 15,
                        height: 15,
                    }
                }));

                console.log('ELK layout applied successfully');
                setPetriNetNodes(positionedNodes);
                setPetriNetEdges(edges);
                setElkAvailable(true);
            }
        } catch (error) {
            console.error('ELK layout failed:', error);
            setElkAvailable(false);
            applyManualLayout();
        }
    }, [rawNodes, rawEdges, setPetriNetNodes, setPetriNetEdges, setElkAvailable, applyManualLayout]);

    return { applyELKLayout, applyManualLayout };
};