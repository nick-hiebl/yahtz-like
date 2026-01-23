import { NumberValue, type Value, isNumberValue } from './types';

export function isValueEqual(value: Value, value2: Value): boolean {
    if (value.type !== value2.type) {
        return false;
    }

    if (value.type === 'number') {
        return value.value === (value2 as NumberValue).value;
    }

    return true;
};

export function countValue(targetValue: number) {
    return (values: Value[]): number => {
        return values.filter(v => v.type === 'number' && v.value === targetValue).length * targetValue;
    };
}

export function hasNOfAKind(count: number, values: Value[]) {
    const countMap: Record<number, number> = {};

    for (const value of values) {
        if (value.type === 'number') {
            countMap[value.value] = (countMap[value.value] ?? 0) + 1;
        }
    }

    return Math.max(...Object.values(countMap)) >= count;
}

export function hasFullHouse(values: Value[]) {
    const countMap: Record<number, number> = {};

    for (const value of values) {
        if (value.type === 'number') {
            countMap[value.value] = (countMap[value.value] ?? 0) + 1;
        }
    }

    const countSet = new Set(Object.values(countMap));

    return countSet.has(2) && countSet.has(3);
}

export function hasRunOfLength(length: number, values: Value[]) {
    const simpleValues = Array.from(new Set(values.filter(isNumberValue).map(v => v.value)));
    simpleValues.sort((a, b) => a - b);

    let runLength = 0;
    let maxLengthFound = 0;

    for (let i = 0; i < simpleValues.length; i++) {
        if (simpleValues[i] === simpleValues[i - 1] + 1) {
            runLength += 1;
            maxLengthFound = Math.max(runLength, maxLengthFound);
        } else {
            runLength = 1;
        }
    }

    return maxLengthFound >= length;
}

export function sumValues(values: Value[]) {
    return values.reduce((total: number, value: Value) => total + (isNumberValue(value) ? value.value : 0), 0);
}

export function sum(values: number[]) {
    return values.reduce((total: number, thisNumber: number) => total + thisNumber, 0);
}
