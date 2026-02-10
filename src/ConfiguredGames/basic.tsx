import { GameStateComponent } from '../GameState';
import type { MoneyProps, PurchaseableElement, PurchaseableTarget } from '../GameState/types';
import { createDice } from '../element';
import { isNumberValue, type Cost, type Element, type Target } from '../types';
import { countMatchingPredicate, sum } from '../value-utils';

const getInitialElements = () => {
    return new Array(1).fill(null).map(() => createDice(6));
};

const getIncrementCost = (incs: number): Cost => ({ dollar: (incs + 1) * (incs + 2) * 2 });

const getRerollCost = (rerolls: number): Cost => ({ dollar: rerolls * (rerolls + 1) });

const getPurchaseableElements = (owned: Element[]): PurchaseableElement[] => {
    const d6Count = owned.filter(e => e.type === 'dice' && e.maxValue.value === 6).length;

    return [
        {
            key: 'd6',
            buyText: 'Buy dice',
            element: () => createDice(6),
            cost: { dollar: d6Count * 10 },
            available: true,
        },
    ];
};

type TargetShopInfo = {
    cost: number;
    buyCondition?: (elements: Element[]) => boolean;
};

const TARGETS: Record<string, Target & TargetShopInfo> = {
    MAX: {
        id: 'max',
        name: 'Max',
        scorer: vs => Math.max(...vs.filter(isNumberValue).map(v => v.value)) ?? 0,
        cost: 11,
    },
    MIN: {
        id: 'min',
        name: 'Min',
        scorer: vs => Math.min(...vs.filter(isNumberValue).map(v => v.value)) ?? 0,
        cost: 11,
    },
    SUM: {
        id: 'sum',
        name: 'Sum',
        scorer: vs => sum(vs.map(v => v.type === 'number' ? v.value : 0)),
        cost: 15,
        buyCondition: es => countMatchingPredicate(es, e => e.type === 'dice', 2),
    },
};

const getInitialTargets = (): Target[] => [TARGETS.MAX];

const getPurchaseableTargets = (owned: Element[]): PurchaseableTarget[] => {
    return Object.values(TARGETS).map(target => {
        return {
            target,
            cost: { dollar: target.cost },
            available: target.buyCondition?.(owned) ?? true,
        };
    });
};

export const BasicGame = ({ money, updateMoney }: MoneyProps) => {
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
        />
    )
};
