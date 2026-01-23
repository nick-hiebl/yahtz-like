import { useState } from 'react';

import { Game } from '../Game/Game';
import { createDice } from '../element';
import { type Element, type Target, type Value, isNumberValue } from '../types';

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

export const GameStateComponent = () => {
    const [elements, setElements] = useState<Element[]>(() => {
        return new Array(1).fill(0).map(() => createDice(6));
    });
    const [numRerolls] = useState(2);
    const [numIncrements] = useState(1);

    const [inGame, setInGame] = useState(false);
    const [money, setMoney] = useState(0);

    if (!inGame) {
        const nextDiceCost = elements.length * 10;

        return (
            <div>
                <button onClick={() => setInGame(true)}>Start game</button>
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
                </div>
            </div>
        );
    }

    return (
        <Game
            elements={elements}
            numRerolls={numRerolls}
            numIncrements={numIncrements}
            targets={INITIAL_GAME}
            onComplete={(score: number) => {
                setMoney(current => score + current);
                setInGame(false);
            }}
        />
    );
};
