import { GameStateComponent } from '../GameState';
import type { MoneyProps, PurchaseableElement, PurchaseableTarget } from '../GameState/types';
import { createCoin } from '../element';
import type { Cost, Element, Target } from '../types';
import { countSymbol } from '../value-utils';

const AUTOMATION_COST = { rocket: 10 };

const getInitialElements = () => {
    return new Array(1).fill(null).map(() => createCoin());
};

const getIncrementCost = (incs: number): Cost => ({ dollar: (incs + 1) * (incs + 2) * 2 });

const getRerollCost = (rerolls: number): Cost => ({ dollar: rerolls * (rerolls + 1) });

const getPurchaseableElements = (owned: Element[]): PurchaseableElement[] => {
    const coinCount = owned.filter(e => e.type === 'coin').length;

    return [
        {
            key: 'coin',
            buyText: 'Buy coin',
            element: () => createCoin(),
            cost: { dollar: coinCount * 10 },
            available: true,
        },
    ];
};

type TargetShopInfo = {
    cost: number;
    buyCondition?: (elements: Element[]) => boolean;
};

const TARGETS: Record<string, Target & TargetShopInfo> = {
    HEAD: {
        id: 'head',
        name: 'Heads',
        scorer: vs => countSymbol('H')(vs) >= 1 ? [{ currency: 'rocket', quantity: 3 }] : [],
        cost: 5,
    },
    DOUBLE_HEADS: {
        id: 'double-heads',
        name: 'Double heads',
        scorer: vs => countSymbol('H')(vs) >= 2 ? [{ currency: 'rocket', quantity: 10, effect: 'multiplier' }] : [],
        cost: 20,
    },
};

const getInitialTargets = (): Target[] => [TARGETS.HEAD];

const getPurchaseableTargets = (owned: Element[]): PurchaseableTarget[] => {
    return Object.values(TARGETS).map(target => {
        return {
            target,
            cost: { dollar: target.cost },
            available: target.buyCondition?.(owned) ?? true,
        };
    });
};

export const CoinsGame = ({ money, updateMoney }: MoneyProps) => {
    return (
        <GameStateComponent
            getInitialElements={getInitialElements}
            getInitialTargets={getInitialTargets}
            getIncrementCost={getIncrementCost}
            getRerollCost={getRerollCost}
            getPurchaseableElements={getPurchaseableElements}
            getPurchaseableTargets={getPurchaseableTargets}
            money={money}
            updateMoney={updateMoney}
            automationCost={AUTOMATION_COST}
        />
    )
};
