export const buildTransitionToStateMap = (stateGraph) => {
    const transitionMap = {};

    stateGraph.edges.forEach(edge => {
        const sourceState = edge.source;
        const transition = edge.label;

        if (!transitionMap[sourceState]) {
            transitionMap[sourceState] = {};
        }

        transitionMap[sourceState][transition] = edge.target;
    });

    return transitionMap;
};