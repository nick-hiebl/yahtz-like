import type { Element, Target } from '../types';

export type GameState = {
    elements: Element[];
};

export type PurchaseableElement = {
    element: () => Element;
    cost: number;
    available: boolean;
    key: string;
    buyText: string;
};

export type PurchaseableTarget = {
    target: Target;
    cost: number;
    available: boolean;
};
