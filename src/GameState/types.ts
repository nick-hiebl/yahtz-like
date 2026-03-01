import type { Cost, Element, GameAction, Money, Target } from '../types';

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

export type MoneyProps = {
    /**
     * Amount of money the player has
     */
    money: Money;
    updateMoney: (delta: Cost, direction: 'gain' | 'loss') => void;
};

export type GameProps = MoneyProps & { onGameStateChange: (action: GameAction) => void };
