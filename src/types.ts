export type NumberValue = { type: 'number'; value: number };

export type Value =
    | NumberValue
    | { type: 'wild' };

export function isNumberValue(value: Value): value is NumberValue {
    return value.type === 'number';
}

export type Target = {
    id: string;
    name: string;
    scorer: (values: Value[]) => number;
    result?: Value[];
    score?: number;
};

export type Dice = {
    type: 'dice';
    values: Value[];
    maxValue: NumberValue;
    getValue: () => Value;
    increment: (current: Value) => Value;
    decrement: (current: Value) => Value;
};

export type Element = Dice;
