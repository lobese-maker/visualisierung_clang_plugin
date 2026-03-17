import { atom } from 'jotai';
import petriNet from '../data/net_reactflow.json';

export const petriNetJsonAtom = atom(petriNet);
export const petriNetNodesAtom = atom([]);
export const petriNetEdgesAtom = atom([]);
export const rawPetriNetNodesAtom = atom(petriNet.nodes);
export const rawPetriNetEdgesAtom = atom(petriNet.edges);