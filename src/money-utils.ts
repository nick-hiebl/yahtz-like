import type { Cost, Money, MoneyTypes } from './types';

export const canAfford = (money: Money, cost: Cost) => {
    return (Object.keys(cost) as MoneyTypes[]).every(key => money[key] >= cost[key]!);
};

export const invertCost = (cost: Cost): Cost => {
    const entries = Object.entries(cost) as [MoneyTypes, number][];

    return Object.fromEntries(entries.map(([key, amount]) => [key, -amount]));
};

export const addMoney = (money: Money, addend: Money | Cost): Money => {
    const entries = Object.entries(money) as [MoneyTypes, number][];
    return Object.fromEntries(entries.map(([key, amount]: [MoneyTypes, number]) => [key, amount + (addend[key] ?? 0)])) as Money;
};

export const addCost = (left: Cost, right: Cost): Cost => {
    const keyObject = { ...left, ...right };

    const keys = Object.keys(keyObject) as MoneyTypes[];

    return Object.fromEntries(keys.map(key => [key, (left[key] ?? 0) + (right[key] ?? 0)]));
};
