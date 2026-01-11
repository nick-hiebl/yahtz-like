import { JSX, useState } from 'react';

import './Game.css';

const NUM_DICE = 5;
const DICE_MAX_FACE = 6;
const INITIAL_REROLLS = 2;

type NumberValue = { type: 'number'; value: number };

type Value =
    | NumberValue
    | { type: 'wild' };

function isNumberValue(value: Value): value is NumberValue {
    return value.type === 'number';
}

const ValueComponent = (props: Value): JSX.Element => {
    if (isNumberValue(props)) {
        return <span>{props.value}</span>;
    } else if (props.type === 'wild') {
        return <span>W</span>;
    }

    return <span>???</span>;
};

const getRandomValue = (): Value => {
    return { type: 'number', value: Math.floor(Math.random() * DICE_MAX_FACE + 1) };
};

type Target = {
    id: string;
    name: string;
    scorer: (values: Value[]) => number;
    result?: Value[];
    score?: number;
};

function countValue(targetValue: number) {
    return (values: Value[]): number => {
        return values.filter(v => v.type === 'number' && v.value === targetValue).length * targetValue;
    };
}

function hasNOfAKind(count: number, values: Value[]) {
    const countMap: Record<number, number> = {};

    for (const value of values) {
        if (value.type === 'number') {
            countMap[value.value] = (countMap[value.value] ?? 0) + 1;
        }
    }

    return Math.max(...Object.values(countMap)) >= count;
}

function hasFullHouse(values: Value[]) {
    const countMap: Record<number, number> = {};

    for (const value of values) {
        if (value.type === 'number') {
            countMap[value.value] = (countMap[value.value] ?? 0) + 1;
        }
    }

    const countSet = new Set(Object.values(countMap));

    return countSet.has(2) && countSet.has(3);
}

function hasRunOfLength(length: number, values: Value[]) {
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

function sumValues(values: Value[]) {
    return values.reduce((total: number, value: Value) => total + (isNumberValue(value) ? value.value : 0), 0);
}

function sum(values: number[]) {
    return values.reduce((total: number, thisNumber: number) => total + thisNumber, 0);
}

const FULL_YAHTZEE_GAME: Target[] = [
    {
        id: 'ones',
        name: 'Aces',
        scorer: countValue(1),
    },
    {
        id: 'twos',
        name: 'Twos',
        scorer: countValue(2),
    },
    {
        id: 'threes',
        name: 'Threes',
        scorer: countValue(3),
    },
    {
        id: 'fours',
        name: 'Fours',
        scorer: countValue(4),
    },
    {
        id: 'fives',
        name: 'Fives',
        scorer: countValue(5),
    },
    {
        id: 'sixes',
        name: 'Sixes',
        scorer: countValue(6),
    },
    {
        id: 'chance',
        name: 'Chance',
        scorer: values => sumValues(values),
    },
    {
        id: 'three-of-a-kind',
        name: 'Three of a kind',
        scorer: values => hasNOfAKind(3, values) ? sumValues(values) : 0,
    },
    {
        id: 'four-of-a-kind',
        name: 'Four of a kind',
        scorer: values => hasNOfAKind(4, values) ? sumValues(values) : 0,
    },
    {
        id: 'full-house',
        name: 'Full house',
        scorer: values => hasFullHouse(values) ? 25 : 0,
    },
    {
        id: 'small-straight',
        name: 'Small straight',
        scorer: values => hasRunOfLength(4, values) ? 30 : 0,
    },
    {
        id: 'long-straight',
        name: 'Long straight',
        scorer: values => hasRunOfLength(5, values) ? 40 : 0,
    },
    {
        id: 'five-of-a-kind',
        name: 'Yahtzee',
        scorer: values => hasNOfAKind(5, values) ? 50 : 0,
    },
];

const DEFAULT_INCS = 3;

export const Game = () => {
    const [incsLeft, setIncsLeft] = useState(DEFAULT_INCS);
    const [rerollsLeft, setRerollsLeft] = useState(INITIAL_REROLLS);
    const [rolls, setRolls] = useState<Value[]>(() => {
        return new Array(NUM_DICE).fill(0).map(getRandomValue);
    });

    const [locks, setLocks] = useState(new Array(NUM_DICE).fill(false));

    const [targets, setTargets] = useState<Target[]>(() => {
        return FULL_YAHTZEE_GAME.slice().map(v => ({ ...v }));
    });

    const reroll = () => {
        if (rerollsLeft <= 0) {
            return;
        }

        setRolls(rolls.map((currentValue, index) => locks[index] ? currentValue : getRandomValue()));
        setRerollsLeft(current => current - 1);
    };

    const lockTarget = (targetId: string) => {
        setTargets(targets => targets.map(target => {
            if (target.id !== targetId) {
                return target;
            }

            return {
                ...target,
                result: rolls.slice(),
                score: target.scorer(rolls),
            };
        }));

        setLocks(new Array(NUM_DICE).fill(false));
        setRolls(new Array(NUM_DICE).fill(0).map(getRandomValue));
        setRerollsLeft(INITIAL_REROLLS);
        setIncsLeft(DEFAULT_INCS);
    };

    const isCompleted = targets.every(target => !!target.result);

    return (
        <div id="game-board">
            <div id="dice-box">
                <div id="dice-list">
                    {rolls.map((value, index) => (
                        <div className="dice-and-lock" key={index}>
                            <div className="inc-dec">
                                <button
                                    className="inc-dec-button"
                                    disabled={isCompleted || incsLeft <= 0 || !isNumberValue(value) || value.value === DICE_MAX_FACE || locks[index]}
                                    onClick={() => {
                                        if (!isNumberValue(value)) {
                                            return;
                                        }

                                        setRolls(currentRolls => currentRolls.map((rollValue, rollIndex) => index === rollIndex ? { ...value, value: value.value + 1 } : rollValue));
                                        setIncsLeft(currentIncsLeft => currentIncsLeft - 1);
                                    }}
                                >
                                    +
                                </button>
                                <button
                                    className="inc-dec-button"
                                    disabled={isCompleted || incsLeft <= 0 || !isNumberValue(value) || value.value === 1 || locks[index]}
                                    onClick={() => {
                                        if (!isNumberValue(value)) {
                                            return;
                                        }

                                        setRolls(currentRolls => currentRolls.map((rollValue, rollIndex) => index === rollIndex ? { ...value, value: value.value - 1 } : rollValue));
                                        setIncsLeft(currentIncsLeft => currentIncsLeft - 1);
                                    }}
                                >
                                    –
                                </button>
                            </div>
                            <div className="dice-value" key={index}>
                                <ValueComponent {...value} />
                            </div>
                            <input
                                disabled={isCompleted}
                                checked={locks[index]}
                                type="checkbox"
                                onChange={e => {
                                    const isChecked = e.currentTarget.checked;
                                    setLocks(current => current.map((lockValue, lockIndex) => lockIndex === index ? isChecked : lockValue));
                                }}
                            />
                        </div>
                    ))}
                </div>
                <div id="game-actions">
                    <div>
                        <button disabled={isCompleted || rerollsLeft <= 0} onClick={reroll}>Re-roll ({rerollsLeft} left)</button>
                    </div>
                    <span>Remaining increments/decrements: {incsLeft}</span>
                </div>
            </div>
            <div id="targets">
                {targets.map(target => (
                    <div className="target" key={target.id}>
                        <div className="target-info">
                            {target.result ? (
                                <div className="target-score">{target.score}</div>
                            ) : (
                                <button className="target-score placeholder" onClick={() => lockTarget(target.id)}>
                                    {target.scorer(rolls)}
                                </button>
                            )}
                            <div>{target.name}</div>
                        </div>
                        {target.result && (
                            <div>
                                {target.result.map((value, index) => (
                                    <div className="dice-value" key={index}>
                                        <ValueComponent {...value} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                <div className="target">
                    <div className="target-info">
                        {isCompleted ? (
                            <div className="target-score">{sum(targets.map(target => target.score ?? 0))}</div>
                        ) : (
                            <div className="target-score placeholder">{sum(targets.map(target => target.score ?? 0))}</div>
                        )}
                        <strong>Total</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};
