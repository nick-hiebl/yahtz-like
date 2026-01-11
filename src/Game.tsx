import { JSX, useEffect, useState } from 'react';

import { type Target, type Value, isNumberValue } from './types';
import { FULL_YAHTZEE_GAME } from './yahtzee';

import './Game.css';
import { sum } from './value-utils';

const getRandomValue = (): Value => {
    return { type: 'number', value: Math.floor(Math.random() * DICE_MAX_FACE + 1) };
};

const ValueComponent = (props: Value): JSX.Element => {
    if (isNumberValue(props)) {
        return <span>{props.value}</span>;
    } else if (props.type === 'wild') {
        return <span>W</span>;
    }

    return <span>???</span>;
};

export const INITIAL_GAME: Target[] = [
    {
        id: 'max',
        name: 'Max',
        scorer: (values: Value[]) => Math.max(...values.filter(isNumberValue).map(v => v.value)) ?? 0,
    },
];

const NUM_DICE = 1;
const DICE_MAX_FACE = 6;
const INITIAL_REROLLS = 2;

const DEFAULT_INCS = 3;

export const Game = () => {
    const [incsLeft, setIncsLeft] = useState(DEFAULT_INCS);
    const [rerollsLeft, setRerollsLeft] = useState(INITIAL_REROLLS);
    const [rolls, setRolls] = useState<Value[]>(() => {
        return new Array(NUM_DICE).fill(0).map(getRandomValue);
    });

    const [locks, setLocks] = useState(new Array(NUM_DICE).fill(false));

    const diceLength = rolls.length;
    const locksLength = locks.length;

    useEffect(() => {
        if (diceLength !== locksLength) {
            setLocks(new Array(diceLength).fill(false));
        }
    }, [diceLength, locksLength]);

    const [targets, setTargets] = useState<Target[]>(() => {
        return INITIAL_GAME.slice().map(v => ({ ...v }));
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
