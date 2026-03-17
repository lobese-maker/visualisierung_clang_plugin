import { atom } from 'jotai';
import petriNet from '../data/net_reactflow.json';
import stateGraph from '../data/sg_reactflow.json';
import { buildTransitionToStateMap } from '../utils/transitionMap';


export const petriNetJsonAtom = atom(petriNet);
export const petriNetNodesAtom = atom([]);
export const petriNetEdgesAtom = atom([]);
export const rawPetriNetNodesAtom = atom(petriNet.nodes);
export const rawPetriNetEdgesAtom = atom(petriNet.edges);


export const stateGraphJsonAtom = atom(stateGraph);
export const statesAtom = atom(stateGraph.states);
export const currentStateIdAtom = atom(stateGraph.metadata?.initialState || "0");
export const historyAtom = atom([stateGraph.metadata?.initialState || "0"]);
export const selectedPathsAtom = atom({});

export const transitionMapAtom = atom(buildTransitionToStateMap(stateGraph));
export const branchingPointsAtom = atom(stateGraph.metadata?.branchingPoints || []);
export const finalStateAtom = atom(stateGraph.metadata?.finalState || "");


export const loadingAtom = atom(true);
export const firingTransitionAtom = atom(null);
export const fireAnimationAtom = atom(false);
export const autoLayoutAtom = atom(true);
export const showClickHelpAtom = atom(false);
export const lastClickedTransitionAtom = atom(null);
export const elkAvailableAtom = atom(true);


export const isProcessingAtom = atom((get) =>
    get(fireAnimationAtom) || get(firingTransitionAtom) !== null
);

export const currentStateAtom = atom((get) => {
    const states = get(statesAtom);
    const currentId = get(currentStateIdAtom);
    return states.find(s => s.id === currentId) || states[0];
});

export const availableTransitionsAtom = atom((get) => {
    const currentId = get(currentStateIdAtom);
    const transitionMap = get(transitionMapAtom);
    if (!transitionMap[currentId]) return [];

    return Object.keys(transitionMap[currentId]).map(transitionId => ({
        transitionId,
        targetStateId: transitionMap[currentId][transitionId]
    }));
});

export const isAtBranchingPointAtom = atom((get) => {
    const currentId = get(currentStateIdAtom);
    const branchingPoints = get(branchingPointsAtom);
    return branchingPoints.includes(currentId);
});

export const isAtFinalStateAtom = atom((get) => {
    const currentId = get(currentStateIdAtom);
    const finalState = get(finalStateAtom);
    return currentId === finalState;
});