import type { Dice, Value } from './types';

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
