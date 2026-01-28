import { useCallback, useState } from 'react';

import { Game, ValueComponent } from '../Game/Game';
import { createCoin, createDice } from '../element';
import { type Element, type Target, isNumberValue } from '../types';
import { countMatchingPredicate, countSymbol, sum } from '../value-utils';
import { GameArguments } from '../Game/types';

import './style.css';

type TargetShopInfo = {
    cost: number;
    buyCondition?: (elements: Element[]) => boolean;
};

const TARGETS: Record<string, Target & TargetShopInfo> = {
    MAX: {
        id: 'max',
        name: 'Max',
        scorer: vs => Math.max(...vs.filter(isNumberValue).map(v => v.value)) ?? 0,
        cost: -1,
    },
    MIN: {
        id: 'min',
        name: 'Min',
        scorer: vs => Math.min(...vs.filter(isNumberValue).map(v => v.value)) ?? 0,
        cost: 11,
    },
    DOUBLE_HEADS: {
        id: 'double-heads',
        name: 'Double heads',
        scorer: vs => countSymbol('H')(vs) >= 2 ? 10 : 0,
        cost: 1,
        buyCondition: es => countMatchingPredicate(es, e => e.type === 'coin', 2),
    },
    DOUBLE_TAILS: {
        id: 'double-tails',
        name: 'Double tails',
        scorer: vs => countSymbol('T')(vs) >= 2 ? 10 : 0,
        cost: 1,
        buyCondition: es => countMatchingPredicate(es, e => e.type === 'coin', 2),
    },
    SUM: {
        id: 'sum',
        name: 'Sum',
        scorer: vs => sum(vs.map(v => v.type === 'number' ? v.value : 0)),
        cost: 15,
        buyCondition: es => countMatchingPredicate(es, e => e.type === 'dice', 2),
    },
};

const WILD_COIN_COST = 40;

const ElementComponent = ({ element }: { element: Element }) => {
    if (element.type === 'dice') {
        return <ValueComponent type="dice" value={element.maxValue} />
    } else if (element.type === 'coin') {
        return <ValueComponent type="coin" value={element.values[0]} />
    }

    return <span>???</span>;
};

const INITIAL_DICE = 1;

export const GameStateComponent = () => {
    const [elements, setElements] = useState<Element[]>(() => {
        return new Array(INITIAL_DICE).fill(0).map(() => createDice(6));
    });
    const [numRerolls, setRerolls] = useState(1);
    const [numIncrements, setIncrements] = useState(0);
    const [targets, setTargets] = useState<Target[]>([TARGETS.MAX]);

    const [gameState, setGameState] = useState<GameArguments & { gameKey: string }>({
        elements,
        numRerolls,
        numIncrements,
        targets,
        gameKey: Math.random().toString(),
    });

    const [money, setMoney] = useState(0);
    const [isComplete, setComplete] = useState(false);

    const nextDiceCost = elements.filter(({ type }) => type === 'dice').length * 10 || 10;
    const nextCoinCost = elements.filter(({ type }) => type === 'coin').length * 5 || 5;
    const nextIncrementCost = (numIncrements + 1) * (numIncrements + 1) * 2;
    const nextRerollCost = numRerolls * (numRerolls + 1);

    const onComplete = useCallback((score: number) => {
        setMoney(current => current + score);
        setComplete(true);
    }, []);

    const buyableTargets = Object.entries(TARGETS)
        .filter(([_, target]) => !targets.some(ownedTarget => ownedTarget.id === target.id))
        .filter(([_, target]) => {
            if (!target.buyCondition) {
                return true;
            }

            return target.buyCondition(elements);
        });

    return (
        <div>
            <Game
                key={gameState.gameKey}
                {...gameState}
                onComplete={onComplete}
                automationEnabled
            />
            <button
                disabled={!isComplete}
                onClick={() => {
                    setComplete(false);
                    setGameState({
                        elements,
                        numRerolls,
                        numIncrements,
                        targets,
                        gameKey: Math.random().toString(),
                    });
                }}
            >
                Start game
            </button>
            <div id="inventory">
                <h2>Inventory</h2>
                <div>
                    Elements:
                    <ul className="inline">
                        {elements.map((element, index) => (
                            <li key={index}>
                                <ElementComponent element={element} />
                            </li>
                        ))}
                    </ul>
                </div>
                <div>Re-rolls: {numRerolls}</div>
                <div>Increments/decrements: {numIncrements}</div>
            </div>
            <div id="shop">
                <h2>Shop</h2>
                <div>Money: ${money}</div>
                <button
                    disabled={money < nextDiceCost}
                    onClick={() => {
                        setMoney(current => current - nextDiceCost);
                        setElements(elements => elements.concat(createDice(6)));
                    }}
                >
                    Buy dice (${nextDiceCost})
                </button>
                <button
                    disabled={money < nextCoinCost}
                    onClick={() => {
                        setMoney(current => current - nextCoinCost);
                        setElements(elements => elements.concat(createCoin()));
                    }}
                >
                    Buy coin (${nextCoinCost})
                </button>
                <button
                    disabled={money < WILD_COIN_COST}
                    onClick={() => {
                        setMoney(current => current - WILD_COIN_COST);
                        setElements(elements => elements.concat(createCoin(0.5, ['W', 'T'])));
                    }}
                >
                    Buy wild coin (${WILD_COIN_COST})
                </button>
                <button
                    disabled={money < nextRerollCost}
                    onClick={() => {
                        setMoney(current => current - nextRerollCost);
                        setRerolls(current => current + 1);
                    }}
                >
                    Buy reroll (${nextRerollCost})
                </button>
                <button
                    disabled={money < nextIncrementCost}
                    onClick={() => {
                        setMoney(current => current - nextIncrementCost);
                        setIncrements(current => current + 1);
                    }}
                >
                    Buy increment (${nextIncrementCost})
                </button>
                {buyableTargets.length > 0 && (
                    <div>
                        <h3>Targets</h3>
                        <ul>
                            {buyableTargets.map(([key, target]) => (
                                <button
                                    key={key}
                                    disabled={money < target.cost || targets.map(t => t.id).includes(target.id)}
                                    onClick={() => {
                                        setMoney(current => current - target.cost);
                                        setTargets(current => current.concat(target));
                                    }}
                                >
                                    {target.name} (${target.cost})
                                </button>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
