import { useCallback, useMemo, useState } from 'react';

import { ValueComponent } from '../Game';
import { type Element, type Target } from '../types';

import { GameManager } from './GameManager';
import type { PurchaseableElement, PurchaseableTarget } from './types';

import './style.css';

const AUTOMATION_COST = 10;

type Props = {
    getInitialElements: () => Element[];
    getInitialTargets: () => Target[];
    getPurchaseableElements: (owned: Element[]) => PurchaseableElement[];
    getPurchaseableTargets: (owned: Element[]) => PurchaseableTarget[];
    getRerollCost: (numRerolls: number) => number;
    getIncrementCost: (numIncrements: number) => number;
};

const ElementComponent = ({ element }: { element: Element }) => {
    if (element.type === 'dice') {
        return <ValueComponent type="dice" value={element.maxValue} />
    } else if (element.type === 'coin') {
        return <ValueComponent type="coin" value={element.values[0]} />
    }

    return <span>???</span>;
};

export const GameStateComponent = ({
    getIncrementCost,
    getInitialElements,
    getInitialTargets,
    getPurchaseableElements,
    getPurchaseableTargets,
    getRerollCost,
}: Props) => {
    const [elements, setElements] = useState<Element[]>(() => getInitialElements());

    const [automationEnabled, setAutomationEnabled] = useState(false);
    const [numRerolls, setRerolls] = useState(1);
    const [numIncrements, setIncrements] = useState(0);
    const [targets, setTargets] = useState<Target[]>(() => getInitialTargets());

    const [money, setMoney] = useState(0);

    const purchaseableElements = useMemo(() => {
        return getPurchaseableElements(elements)
            .filter(el => el.available);
    }, [elements]);

    const purchaseableTargets = useMemo(() => {
        const ownedTargetSet = new Set(...targets.map(t => t.id));
        return getPurchaseableTargets(elements)
            .filter(target => {
                return target.available && !ownedTargetSet.has(target.target.id);
            });
    }, [elements]);

    const nextRerollCost = getRerollCost(numRerolls);
    const nextIncrementCost = getIncrementCost(numIncrements);

    const onComplete = useCallback((score: number) => {
        setMoney(current => current + score);
    }, []);

    return (
        <div className="column gap-8px">
            <GameManager
                elements={elements}
                targets={targets}
                automationEnabled={automationEnabled}
                numRerolls={numRerolls}
                numIncrements={numIncrements}
                onComplete={onComplete}
            />
            <div id="inventory" className="column gap-8px">
                <h2>Inventory</h2>
                <div className="column gap-4px">
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
            <div id="shop" className="column gap-8px">
                <h2>Shop</h2>
                <div>Money: ${money}</div>
                <div className="row gap-4px">
                    {purchaseableElements.map(({ available, buyText, key, cost, element }) => {
                        if (!available) {
                            return null;
                        }

                        const price = cost;

                        return (
                            <button
                                key={key}
                                disabled={money < price}
                                onClick={() => {
                                    setMoney(current => current - price);
                                    setElements(elements => elements.concat(element()));
                                }}
                            >
                                {buyText} (${price})
                            </button>
                        );
                    })}
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
                    <button
                        disabled={money < AUTOMATION_COST || automationEnabled}
                        onClick={() => {
                            setMoney(current => current - AUTOMATION_COST);
                            setAutomationEnabled(true);
                        }}
                    >
                        Buy automation ({automationEnabled ? 'Bought' : `$${AUTOMATION_COST}`})
                    </button>
                </div>
                {purchaseableTargets.length > 0 && (
                    <div className="column gap-8px">
                        <h3>Targets</h3>
                        <ul className="column gap-4px">
                            {purchaseableTargets.map(({ available, cost, target }) => {
                                if (!available || targets.map(t => t.id).includes(target.id)) {
                                    return null;
                                }

                                return (
                                    <button
                                        key={target.id}
                                        disabled={money < cost || targets.map(t => t.id).includes(target.id)}
                                        onClick={() => {
                                            setMoney(current => current - cost);
                                            setTargets(current => current.concat(target));
                                        }}
                                    >
                                        {target.name} (${cost})
                                    </button>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};
