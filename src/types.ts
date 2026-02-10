export type NumberValue = { type: 'number'; value: number };
export type SymbolValue = { type: 'symbol'; value: string };

export type Value =
    | NumberValue
    | SymbolValue
    | { type: 'wild' };

export function isNumberValue(value: Value): value is NumberValue {
    return value.type === 'number';
}

export type Target = {
    id: string;
    name: string;
    scorer: (values: Value[]) => number;
    result?: Roll[];
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

export type Coin = {
    type: 'coin';
    values: Value[];
    getValue: () => Value;
};

export type Element = Dice | Coin;

export type Roll = { element: Element; value: Value };

export type MoneyTypes = 'dollar' | 'rocket';

export type Money = Record<MoneyTypes, number>;

export type Cost = Partial<Money>;
