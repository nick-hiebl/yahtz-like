import { useMemo } from 'react';

import { GameStateComponent } from '../GameState';
import type { GameProps, PurchaseableElement, PurchaseableTarget } from '../GameState/types';
import { isNumberValue, type Dice, type Element, type SymbolValue, type Target, type Upgrade } from '../types';
import { countMatchingPredicate, sum } from '../value-utils';

const AUTOMATION_COST = { dollar: 10 };

const settlerDice = (): Dice => {
    const options: SymbolValue[] = [
        { type: 'symbol', value: 'wheat' },
        { type: 'symbol', value: 'sheep' },
        { type: 'symbol', value: 'wood' },
        { type: 'symbol', value: 'brick' },
        { type: 'symbol', value: 'rock' },
    ];

    return {
        type: 'dice',
        values: options,
        maxValue: { type: 'number', value: 0 },
        getValue: () => {
            return options[Math.floor(Math.random() * options.length)];
        },
        increment: v => v,
        decrement: v => v,
    };
};

const getInitialElements = () => {
    return new Array(1).fill(null).map(settlerDice);
};

const getPurchaseableElements = (owned: Element[]): PurchaseableElement[] => {
    const diceCount = owned.filter(e => e.type === 'dice' && e.maxValue.value === 0).length;

    return [
        {
            key: 's-dice',
            buyText: 'Settler dice',
            element: settlerDice,
            cost: { dollar: diceCount * 10 },
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
        scorer: vs => [{ currency: 'dollar', quantity: Math.max(...vs.filter(isNumberValue).map(v => v.value)) ?? 0 }],
        cost: 11,
    },
    MIN: {
        id: 'min',
        name: 'Min',
        scorer: vs => [{ currency: 'dollar', quantity: Math.min(...vs.filter(isNumberValue).map(v => v.value)) ?? 0 }],
        cost: 11,
    },
    SUM: {
        id: 'sum',
        name: 'Sum',
        scorer: vs => [{ currency: 'dollar', quantity: sum(vs.map(v => v.type === 'number' ? v.value : 0)) }],
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

export const SettlerGame = ({ money, onGameStateChange, updateMoney }: GameProps) => {
    const upgrades = useMemo<Upgrade[]>(() => {
        return [
            {
                id: 'buy-coins-game',
                name: 'Buy coins game',
                cost: { dollar: 50 },
                onPurchase: () => {
                    onGameStateChange({ type: 'enable-tab', tabName: 'coin' });
                },
            },
        ];
    }, [onGameStateChange]);
    return (
        <GameStateComponent
            getInitialElements={getInitialElements}
            getInitialTargets={getInitialTargets}
            getPurchaseableElements={getPurchaseableElements}
            getPurchaseableTargets={getPurchaseableTargets}
            money={money}
            updateMoney={updateMoney}
            automationCost={AUTOMATION_COST}
            upgrades={upgrades}
        />
    )
};
