import { atom } from 'jotai';
import stateGraph from '../data/sg_reactflow.json';
import { buildTransitionToStateMap } from '../utils/transitionMap';

export const stateGraphJsonAtom = atom(stateGraph);
export const statesAtom = atom(stateGraph.states);
export const currentStateIdAtom = atom(stateGraph.metadata?.initialState || "0");
export const historyAtom = atom([stateGraph.metadata?.initialState || "0"]);
export const selectedPathsAtom = atom({});

export const transitionMapAtom = atom(buildTransitionToStateMap(stateGraph));
export const branchingPointsAtom = atom(stateGraph.metadata?.branchingPoints || []);
export const finalStateAtom = atom(stateGraph.metadata?.finalState || "");