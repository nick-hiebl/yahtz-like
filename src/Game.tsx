import { useState } from 'react';

import './Game.css';

const NUM_DICE = 5;
const DICE_MAX_FACE = 6;
const INITIAL_REROLLS = 2;

type Value = number;

const getRandomValue = (): Value => {
    return Math.floor(Math.random() * DICE_MAX_FACE + 1);
};

type Target = {
    id: string;
    name: string;
    scorer: (values: Value[]) => number;
    result?: Value[];
    score?: number;
};

function countValue(targetValue: Value) {
    return (values: Value[]): number => {
        return values.filter(v => v === targetValue).length * targetValue;
    };
}

function hasNOfAKind(count: number, values: Value[]) {
    const countMap: Record<Value, number> = {};

    for (const value of values) {
        countMap[value] = (countMap[value] ?? 0) + 1;
    }

    return Math.max(...Object.values(countMap)) >= count;
}

function hasFullHouse(values: Value[]) {
    const countMap: Record<Value, number> = {};

    for (const value of values) {
        countMap[value] = (countMap[value] ?? 0) + 1;
    }

    const countSet = new Set(Object.values(countMap));

    return countSet.has(2) && countSet.has(3);
}

function hasRunOfLength(length: number, values: Value[]) {
    const simpleValues = Array.from(new Set(values));
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

function sum(values: Value[]) {
    return values.reduce((a, b) => a + b, 0);
}

const DEFAULT_TARGETS: Target[] = [
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
        scorer: values => sum(values),
    },
    {
        id: 'three-of-a-kind',
        name: 'Three of a kind',
        scorer: values => hasNOfAKind(3, values) ? sum(values) : 0,
    },
    {
        id: 'four-of-a-kind',
        name: 'Four of a kind',
        scorer: values => hasNOfAKind(4, values) ? sum(values) : 0,
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
        name: 'Five of a kind',
        scorer: values => hasNOfAKind(5, values) ? 50 : 0,
    },
];

const DEFAULT_INCS = 3;

export const Game = () => {
    const [incsLeft, setIncsLeft] = useState(DEFAULT_INCS);
    const [rerollsLeft, setRerollsLeft] = useState(INITIAL_REROLLS);
    const [rolls, setRolls] = useState(() => {
        return new Array(NUM_DICE).fill(0).map(getRandomValue);
    });

    const [locks, setLocks] = useState(new Array(NUM_DICE).fill(false));

    const [targets, setTargets] = useState(() => {
        return DEFAULT_TARGETS.slice().map(v => ({ ...v }));
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
                                    disabled={isCompleted || incsLeft <= 0 || value === DICE_MAX_FACE || locks[index]}
                                    onClick={() => {
                                        setRolls(currentRolls => currentRolls.map((rollValue, rollIndex) => index === rollIndex ? rollValue + 1 : rollValue));
                                        setIncsLeft(currentIncsLeft => currentIncsLeft - 1);
                                    }}
                                >
                                    +
                                </button>
                                <button
                                    disabled={isCompleted || incsLeft <= 0 || value === 1 || locks[index]}
                                    onClick={() => {
                                        setRolls(currentRolls => currentRolls.map((rollValue, rollIndex) => index === rollIndex ? rollValue - 1 : rollValue));
                                        setIncsLeft(currentIncsLeft => currentIncsLeft - 1);
                                    }}
                                >
                                    -
                                </button>
                            </div>
                            <div className="dice-value" key={index}>{value}</div>
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
                            {target.score ? (
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
                                    <div className="dice-value" key={index}>{value}</div>
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
