import type { Coin, Dice, Value } from './types';

const getRandomListItem = <T>(items: T[]): T => {
    return items[Math.floor(Math.random() * items.length)];
};

export const createDice = (maxValue: number): Dice => {
    const increment = (value: Value): Value => {
        if (value.type === 'number') {
            return { type: 'number', value: Math.min(value.value + 1, maxValue) };
        }
        
        return value;
    };

    const decrement = (value: Value): Value => {
        if (value.type === 'number') {
            return { type: 'number', value: Math.max(value.value - 1, 1) };
        }
        
        return value;
    };

    const values: Value[] = new Array(maxValue).fill(0).map((_, index) => ({ type: 'number', value: index + 1 }));

    return {
        type: 'dice',
        maxValue: { type: 'number', value: maxValue },
        values,
        increment,
        decrement,
        getValue: () => getRandomListItem(values),
    };
};

export const createCoin = (odds = 0.5, values: ['W' | string, 'W' | string] = ['H', 'T']): Coin => {
    const realValues: Value[] = values.map(v => v === 'W' ? { type: 'wild' } : { type: 'symbol', value: v });
    return {
        type: 'coin',
        values: realValues,
        getValue: () => {
            if (Math.random() < odds) return realValues[0];
            return realValues[1];
        },
    };
};
