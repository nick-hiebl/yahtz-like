import { useCallback, useEffect, useState } from 'react';

import { type Element, type Roll, type Target, type Value, isNumberValue } from '../types';
import { isValueEqual, sum } from '../value-utils';

import { gameAutomation } from './automation';
import type { GameArguments } from './types';

import './Game.css';

type ValueComponentProps = {
    value: Value;
    type: Element['type'];
    size?: 'medium' | 'small';
};

export const ValueComponent = ({ value, size, type }: ValueComponentProps) => {
    const sizeClasses = size === 'small' ? 'small' : '';

    if (type === 'coin') {
        return (
            <div className={`coin-value ${sizeClasses}`}>
                <span>{value.type === 'wild' ? 'W' : value.value}</span>
            </div>
        );
    }

    if (isNumberValue(value)) {
        return (
            <div className={`dice-value ${sizeClasses}`}>
                <span>{value.value}</span>
            </div>
        );
    } else if (value.type === 'wild') {
        return (
            <div className={`dice-value ${sizeClasses}`}>
                <span>W</span>
            </div>
        );
    }

    return (
        <div className={`dice-value ${sizeClasses}`}>
            <span>???</span>
        </div>
    );
};

const getRoll = (element: Element): Roll => ({ element, value: element.getValue() });

type GameProps = GameArguments & {
    onComplete: (score: number) => void;
    automationEnabled?: boolean;
    automationOn: boolean;
    setAutomationOn: (state: boolean) => void;
};

const AUTOMATION_DURATION = 1_000;
const MAX_FITTING_ELEMENTS = 8;

export const Game = (props: GameProps) => {
    const {
        automationEnabled,
        automationOn,
        elements,
        numIncrements,
        numRerolls,
        onComplete,
        setAutomationOn,
    } = props;

    const [incsLeft, setIncsLeft] = useState(numIncrements);
    const [rerollsLeft, setRerollsLeft] = useState(numRerolls);
    const [rolls, setRolls] = useState<Roll[]>(() => {
        return elements.map(getRoll);
    });

    const [locks, setLocks] = useState(new Array(elements.length).fill(false));

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

    const reroll = useCallback(() => {
        if (rerollsLeft <= 0) {
            return;
        }

        setRolls(rolls.map((roll, index) => {
            if (locks[index]) return roll;

            return { element: roll.element, value: roll.element.getValue() };
        }));
        setRerollsLeft(current => current - 1);
    }, [locks, rerollsLeft, rolls]);

    const lockTarget = useCallback((targetId: string) => {
        const anyIncompleteTarget = targets.some(target => target.id !== targetId && target.result == null);
        setTargets(targets => targets.map(target => {
            if (target.id !== targetId) {
                return target;
            }

            const values = rolls.map(element => element.value);

            return {
                ...target,
                result: rolls,
                score: target.scorer(values),
            };
        }));

        setLocks(new Array(elements.length).fill(false));

        if (anyIncompleteTarget) {
            setRolls(elements.map(getRoll));
        }

        setRerollsLeft(numRerolls);
        setIncsLeft(numIncrements);
    }, [elements, numIncrements, numRerolls, rolls, targets]);

    const isCompleted = targets.every(target => !!target.result);

    useEffect(() => {
        if (!isCompleted) {
            return;
        }

        onComplete(sum(targets.map(v => v.score ?? 0)));
    }, [onComplete, isCompleted, targets]);

    useEffect(() => {
        if (isCompleted || !automationEnabled || !automationOn) {
            return;
        }

        const t = setTimeout(() => {
            const action = gameAutomation(rolls, targets.filter(t => !t.result), rerollsLeft);

            if (action.type === 'reroll') {
                reroll();
            } else if (action.type === 'target') {
                lockTarget(action.id);
            }
        }, AUTOMATION_DURATION);

        return () => {
            clearTimeout(t);
        }
    }, [automationEnabled, automationOn, isCompleted, lockTarget, reroll, rerollsLeft, rolls, targets]);

    return (
        <div className="game-container">
            {automationEnabled && (
                <label>
                    <input
                        type="checkbox"
                        checked={automationOn}
                        onChange={e => {
                            setAutomationOn(e.currentTarget.checked);
                        }}
                    />
                    Automation on?
                </label>
            )}
            <div id="game-board" data-completed={isCompleted}>
                <div id="dice-box">
                    <div id="dice-list">
                        {rolls.map(({ element, value }, index) => (
                            <div className="dice-and-lock" key={index}>
                                {element.type === 'dice' && numIncrements > 0 && (
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
                                <ValueComponent type={element.type} value={value} />
                                {elements.length > 1 && (
                                    <input
                                        disabled={isCompleted}
                                        checked={locks[index]}
                                        type="checkbox"
                                        onChange={e => {
                                            const isChecked = e.currentTarget.checked;
                                            setLocks(current => current.map((lockValue, lockIndex) => lockIndex === index ? isChecked : lockValue));
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div id="game-actions">
                        {numRerolls > 0 && (
                            <div>
                                <button disabled={isCompleted || rerollsLeft <= 0 || locks.every(v => v)} onClick={reroll}>Re-roll ({rerollsLeft} left)</button>
                            </div>
                        )}
                        {numIncrements > 0 && (
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
                                <div className="target-result row gap-4px">
                                    {target.result.map((roll, index) => (
                                        <ValueComponent key={index} type={roll.element.type} value={roll.value} size="small" />
                                    ))}
                                    {target.result.length > MAX_FITTING_ELEMENTS && (
                                        <div className="overflow-gradient" />
                                    )}
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
        </div>
    );
};
