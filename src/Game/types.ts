import { Element, Target } from '../types';

export type GameArguments = {
    elements: Element[];
    numRerolls: number;
    numIncrements: number;

    targets: Target[];
};

export type Action =
    | { type: 'reroll' }
    | { type: 'target'; id: string };
