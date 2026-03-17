let elkPromise = null;

export const getELK = async () => {
    if (!elkPromise) {
        elkPromise = import('elkjs/lib/elk.bundled.js').then(module => {
            const ELK = module.default;
            return new ELK();
        });
    }
    return elkPromise;
};

export const createELKGraph = (nodes, edges) => {
    return {
        id: "root",
        layoutOptions: {
            'elk.algorithm': 'layered',
            'elk.direction': 'RIGHT',
            'elk.layered.spacing.nodeNodeBetweenLayers': '150',
            'elk.spacing.nodeNode': '120',
            'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
            'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
            'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
            'elk.layered.cycleBreaking.strategy': 'DEPTH_FIRST',
            'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
            'elk.layered.mergeEdges': 'true',
            'elk.layered.feedbackEdges': 'true',
            'elk.edgeRouting': 'SPLINES',
            'elk.contentAlignment': 'H_CENTER',
            'elk.separateConnectedComponents': 'false',
            'elk.padding': '[top=50, left=50, bottom=50, right=50]',
        },
        children: nodes.map(node => ({
            id: node.id,
            width: node.data.type === 'place' ? 100 : 140,
            height: node.data.type === 'place' ? 100 : 80,
        })),
        edges: edges.map(edge => ({
            id: edge.id,
            sources: [edge.source],
            targets: [edge.target],
        }))
    };
};