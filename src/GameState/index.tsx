import { useCallback, useState } from 'react';

import { Game, ValueComponent } from '../Game/Game';
import { createDice } from '../element';
import { type Element, type Target, type Value, isNumberValue } from '../types';
import { GameArguments } from '../Game/types';

import './style.css';

export const INITIAL_GAME: Target[] = [
    {
        id: 'max',
        name: 'Max',
        scorer: (values: Value[]) => Math.max(...values.filter(isNumberValue).map(v => v.value)) ?? 0,
    },
    {
        id: 'min',
        name: 'Min',
        scorer: (values: Value[]) => Math.min(...values.filter(isNumberValue).map(v => v.value)) ?? 0,
    },
];

const ElementComponent = ({ element }: { element: Element }) => {
    if (element.type === 'dice') {
        return <ValueComponent {...element.maxValue} />
    }

    return <span>???</span>;
};

export const GameStateComponent = () => {
    const [elements, setElements] = useState<Element[]>(() => {
        return new Array(1).fill(0).map(() => createDice(6));
    });
    const [numRerolls, setRerolls] = useState(1);
    const [numIncrements, setIncrements] = useState(0);

    const [gameState, setGameState] = useState<GameArguments & { gameKey: string }>({
        elements,
        numRerolls,
        numIncrements,
        targets: INITIAL_GAME,
        gameKey: Math.random().toString(),
    });

    const [money, setMoney] = useState(0);
    const [isComplete, setComplete] = useState(false);

    const nextDiceCost = elements.length * 10;
    const nextIncrementCost = (numIncrements + 1) * (numIncrements + 1) * 2;
    const nextRerollCost = numRerolls * (numRerolls + 1);

    const onComplete = useCallback((score: number) => {
        setMoney(current => current + score);
        setComplete(true);
    }, []);

    return (
        <div>
            <Game
                key={gameState.gameKey}
                {...gameState}
                onComplete={onComplete}
            />
            <button
                disabled={!isComplete}
                onClick={() => {
                    setComplete(false);
                    setGameState({
                        elements,
                        numRerolls,
                        numIncrements,
                        targets: INITIAL_GAME,
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
            </div>
        </div>
    );
};
