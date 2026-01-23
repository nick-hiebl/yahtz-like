import { JSX, useEffect, useState } from 'react';

import { type Element, type Target, type Value, isNumberValue } from '../types';
import { isValueEqual, sum } from '../value-utils';

import type { GameArguments } from './types';

import './Game.css';

export const ValueComponent = (props: Value) => {
    if (isNumberValue(props)) {
        return (
            <div className="dice-value">
                <span>{props.value}</span>
            </div>
        );
    } else if (props.type === 'wild') {
        return (
            <div className="dice-value">
                <span>W</span>
            </div>
        );
    }

    return (
        <div className="dice-value">
            <span>???</span>
        </div>
    );
};

type Roll = { element: Element; value: Value };

const getRoll = (element: Element): Roll => ({ element, value: element.getValue() });

type GameProps = GameArguments & {
    onComplete: (score: number) => void;
};

export const Game = (props: GameProps) => {
    const [incsLeft, setIncsLeft] = useState(props.numIncrements);
    const [rerollsLeft, setRerollsLeft] = useState(props.numRerolls);
    const [rolls, setRolls] = useState<Roll[]>(() => {
        return props.elements.map(getRoll);
    });

    const [locks, setLocks] = useState(new Array(props.elements.length).fill(false));

    const diceLength = rolls.length;
    const locksLength = locks.length;

    useEffect(() => {
        if (diceLength !== locksLength) {
            setLocks(new Array(diceLength).fill(false));
        }
    }, [diceLength, locksLength]);

    const [targets, setTargets] = useState<Target[]>(() => {
        return props.targets.slice().map(v => ({ ...v }));
    });

    const reroll = () => {
        if (rerollsLeft <= 0) {
            return;
        }

        setRolls(rolls.map((roll, index) => {
            if (locks[index]) return roll;

            return { element: roll.element, value: roll.element.getValue() };
        }));
        setRerollsLeft(current => current - 1);
    };

    const lockTarget = (targetId: string) => {
        const anyIncompleteTarget = targets.some(target => target.id !== targetId && target.result == null);
        setTargets(targets => targets.map(target => {
            if (target.id !== targetId) {
                return target;
            }

            const values = rolls.map(element => element.value);

            return {
                ...target,
                result: values,
                score: target.scorer(values),
            };
        }));

        setLocks(new Array(props.elements.length).fill(false));

        if (anyIncompleteTarget) {
            setRolls(props.elements.map(getRoll));
        }

        setRerollsLeft(props.numRerolls);
        setIncsLeft(props.numIncrements);
    };

    const isCompleted = targets.every(target => !!target.result);

    return (
        <div id="game-board">
            <div id="dice-box">
                <div id="dice-list">
                    {rolls.map(({ element, value }, index) => (
                        <div className="dice-and-lock" key={index}>
                            {element.type === 'dice' && props.numIncrements > 0 && (
                                <div className="inc-dec">
                                    <button
                                        className="inc-dec-button"
                                        disabled={isCompleted || incsLeft <= 0 || !isNumberValue(value) || isValueEqual(value, element.increment(value)) || locks[index]}
                                        onClick={() => {
                                            if (!isNumberValue(value)) {
                                                return;
                                            }

                                            setRolls(currentRolls => currentRolls.map((roll, rollIndex) => index === rollIndex ? { ...roll, value: element.increment(value) } : roll));
                                            setIncsLeft(currentIncsLeft => currentIncsLeft - 1);
                                        }}
                                    >
                                        +
                                    </button>
                                    <button
                                        className="inc-dec-button"
                                        disabled={isCompleted || incsLeft <= 0 || !isNumberValue(value) || isValueEqual(value, element.decrement(value)) || locks[index]}
                                        onClick={() => {
                                            if (!isNumberValue(value)) {
                                                return;
                                            }

                                            setRolls(currentRolls => currentRolls.map((roll, rollIndex) => index === rollIndex ? { ...roll, value: element.decrement(value) } : roll));
                                            setIncsLeft(currentIncsLeft => currentIncsLeft - 1);
                                        }}
                                    >
                                        –
                                    </button>
                                </div>
                            )}
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
                    {props.numRerolls > 0 && (
                        <div>
                            <button disabled={isCompleted || rerollsLeft <= 0} onClick={reroll}>Re-roll ({rerollsLeft} left)</button>
                        </div>
                    )}
                    {props.numIncrements > 0 && (
                        <span>Remaining increments/decrements: {incsLeft}</span>
                    )}
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
                                    {target.scorer(rolls.map(({ value }) => value))}
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
                        {isCompleted && (
                            <button onClick={() => {
                                props.onComplete(sum(targets.map(v => v.score ?? 0)));
                            }}>
                                Lock in
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
