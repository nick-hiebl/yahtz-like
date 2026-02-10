import { useCallback, useEffect, useState } from 'react';

import { Game } from '../Game';
import { GameArguments } from '../Game/types';
import type { Cost, Element, Target } from '../types';

import './style.css';

const RESET_TIMEOUT = 1_000;

type Props = {
    elements: Element[];
    automationEnabled: boolean;
    numRerolls: number;
    numIncrements: number;
    targets: Target[];

    onComplete: (reward: Cost) => void;
};

export const GameManager = ({ elements, automationEnabled, numRerolls, numIncrements, onComplete, targets }: Props) => {
    const [automationOn, setAutomationOn] = useState(false);
    const [autoReset, setAutoReset] = useState(false);

    const [gameState, setGameState] = useState<GameArguments & { gameKey: string }>({
        elements,
        numRerolls,
        numIncrements,
        targets,
        gameKey: Math.random().toString(),
    });

    const [isComplete, setComplete] = useState(false);

    const onGameComplete = useCallback((reward: Cost) => {
        onComplete(reward);
        setComplete(true);
    }, [onComplete]);

    const resetGame = useCallback(() => {
        setComplete(false);
        setGameState({
            elements,
            numIncrements,
            numRerolls,
            targets,
            gameKey: Math.random().toString(),
        });
    }, [elements, numIncrements, numRerolls, targets]);

    useEffect(() => {
        if (!autoReset || !isComplete) {
            return;
        }

        const t = setTimeout(() => {
            resetGame();
        }, RESET_TIMEOUT);

        return () => {
            clearTimeout(t);
        };
    }, [autoReset, isComplete, resetGame]);

    return (
        <div className="column gap-8px">
            <Game
                key={gameState.gameKey}
                {...gameState}
                onComplete={onGameComplete}
                automationEnabled={automationEnabled}
                automationOn={automationEnabled && automationOn}
                setAutomationOn={setAutomationOn}
            />
            <div className="row">
                <button
                    disabled={!isComplete}
                    onClick={() => {
                        resetGame();
                    }}
                >
                    Start game
                </button>
                {automationEnabled && (
                    <label>
                        <input
                            type="checkbox"
                            checked={autoReset}
                            onChange={e => {
                                setAutoReset(e.currentTarget.checked);
                            }}
                        />
                        Auto-reset?
                    </label>
                )}
            </div>
        </div>
    );
};
