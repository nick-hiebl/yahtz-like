import type { Cost, Element, Target } from '../types';

export type GameState = {
    elements: Element[];
};

export type PurchaseableElement = {
    element: () => Element;
    cost: Cost;
    available: boolean;
    key: string;
    buyText: string;
};

export type PurchaseableTarget = {
    target: Target;
    cost: Cost;
    available: boolean;
};
