import { useCallback, useMemo, useState } from 'react';

import { ValueComponent } from '../Game';
import { canAfford } from '../money-utils';
import type { Money, Cost, Element, Target } from '../types';

import { GameManager } from './GameManager';
import type { PurchaseableElement, PurchaseableTarget } from './types';

import './style.css';

const AUTOMATION_COST = { dollar: 10 };

type Props = {
    /**
     * Amount of money the player has
     */
    money: Money;
    updateMoney: (delta: Cost, direction: 'gain' | 'loss') => void;
    getInitialElements: () => Element[];
    getInitialTargets: () => Target[];
    getPurchaseableElements: (owned: Element[]) => PurchaseableElement[];
    getPurchaseableTargets: (owned: Element[]) => PurchaseableTarget[];
    getRerollCost: (numRerolls: number) => Cost;
    getIncrementCost: (numIncrements: number) => Cost;
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
    money,
    updateMoney,
}: Props) => {
    const [elements, setElements] = useState<Element[]>(() => getInitialElements());

    const [automationEnabled, setAutomationEnabled] = useState(false);
    const [numRerolls, setRerolls] = useState(1);
    const [numIncrements, setIncrements] = useState(0);
    const [targets, setTargets] = useState<Target[]>(() => getInitialTargets());

    // const [money, setMoney] = useState(0);

    const purchaseableElements = useMemo(() => {
        return getPurchaseableElements(elements)
            .filter(el => el.available);
    }, [elements, getPurchaseableElements]);

    const purchaseableTargets = useMemo(() => {
        const ownedTargetSet = new Set(...targets.map(t => t.id));
        return getPurchaseableTargets(elements)
            .filter(target => {
                return target.available && !ownedTargetSet.has(target.target.id);
            });
    }, [elements, getPurchaseableTargets, targets]);

    const nextRerollCost = getRerollCost(numRerolls);
    const nextIncrementCost = getIncrementCost(numIncrements);

    const onComplete = useCallback((reward: Cost) => {
        updateMoney(reward, 'gain');
    }, [updateMoney]);

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
                <div>Money: ${money.dollar}</div>
                <div className="row gap-4px">
                    {purchaseableElements.map(({ available, buyText, key, cost: price, element }) => {
                        if (!available) {
                            return null;
                        }

                        return (
                            <button
                                key={key}
                                disabled={!canAfford(money, price)}
                                onClick={() => {
                                    updateMoney(price, 'loss');
                                    setElements(elements => elements.concat(element()));
                                }}
                            >
                                {buyText} (${price.dollar})
                            </button>
                        );
                    })}
                    <button
                        disabled={!canAfford(money, nextRerollCost)}
                        onClick={() => {
                            updateMoney(nextRerollCost, 'loss');
                            setRerolls(current => current + 1);
                        }}
                    >
                        Buy reroll (${nextRerollCost.dollar})
                    </button>
                    <button
                        disabled={!canAfford(money, nextIncrementCost)}
                        onClick={() => {
                            updateMoney(nextIncrementCost, 'loss');
                            setIncrements(current => current + 1);
                        }}
                    >
                        Buy increment (${nextIncrementCost.dollar})
                    </button>
                    <button
                        disabled={!canAfford(money, AUTOMATION_COST) || automationEnabled}
                        onClick={() => {
                            updateMoney(AUTOMATION_COST, 'loss');
                            setAutomationEnabled(true);
                        }}
                    >
                        Buy automation ({automationEnabled ? 'Bought' : `$${AUTOMATION_COST.dollar}`})
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
                                            updateMoney(cost, 'loss');
                                            setTargets(current => current.concat(target));
                                        }}
                                    >
                                        {target.name} (${cost.dollar})
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
