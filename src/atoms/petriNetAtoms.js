import { atom } from 'jotai';
import stateGraph from '../data/sg_reactflow.json';
import petriNet from '../data/net_reactflow.json';

// Raw data atoms
export const petriNetDataAtom = atom(petriNet);
export const stateGraphDataAtom = atom(stateGraph);

// Petri net state atoms
export const petriNetNodesAtom = atom([]);
export const petriNetEdgesAtom = atom([]);
export const petriNetLoadingAtom = atom(true);
export const elkAvailableAtom = atom(true);
export const autoLayoutAtom = atom(true);

// Simulation state atoms
export const currentStateIdAtom = atom(stateGraph.metadata?.initialState || "0");
export const historyAtom = atom([stateGraph.metadata?.initialState || "0"]);
export const selectedPathsAtom = atom({});
export const firingTransitionAtom = atom(null);
export const fireAnimationAtom = atom(false);
export const lastClickedTransitionAtom = atom(null);

// UI state atoms
export const showClickHelpAtom = atom(false);
export const clickableTransitionsAtom = atom(new Set());

// Derived atoms
export const currentStateAtom = atom(
    (get) => {
        const stateId = get(currentStateIdAtom);
        const stateGraph = get(stateGraphDataAtom);
        return stateGraph.states.find(s => s.id === stateId) || stateGraph.states[0];
    }
);

export const transitionMapAtom = atom(
    (get) => {
        const stateGraph = get(stateGraphDataAtom);
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
    }
);

export const availableTransitionsAtom = atom(
    (get) => {
        const stateId = get(currentStateIdAtom);
        const transitionMap = get(transitionMapAtom);

        if (!stateId || !transitionMap[stateId]) return [];

        return Object.keys(transitionMap[stateId]).map(transitionId => ({
            transitionId,
            targetStateId: transitionMap[stateId][transitionId]
        }));
    }
);

export const isAtBranchingPointAtom = atom(
    (get) => {
        const stateId = get(currentStateIdAtom);
        const stateGraph = get(stateGraphDataAtom);
        return stateGraph.metadata?.branchingPoints?.includes(stateId) || false;
    }
);

export const isAtFinalStateAtom = atom(
    (get) => {
        const stateId = get(currentStateIdAtom);
        const stateGraph = get(stateGraphDataAtom);
        return stateId === stateGraph.metadata?.finalState;
    }
);