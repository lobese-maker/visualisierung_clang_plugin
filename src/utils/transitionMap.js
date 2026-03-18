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

export const getTargetState = (transitionMap, currentState, transitionId) => {
    if (!transitionMap || !currentState || !transitionId) return null;
    return transitionMap[currentState]?.[transitionId];
};