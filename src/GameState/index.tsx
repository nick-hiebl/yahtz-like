import { useCallback, useMemo, useState } from 'react';

import { ElementComponent } from '../Game/Element';
import { canAfford } from '../money-utils';
import type { Cost, Element, Target } from '../types';

import { CostComponent } from '../Game/Cost';
import { GameManager } from './GameManager';
import type { MoneyProps, PurchaseableElement, PurchaseableTarget } from './types';

import './style.css';

const AUTOMATION_COST = { dollar: 10 };

type Props = MoneyProps & {
    getInitialElements: () => Element[];
    getInitialTargets: () => Target[];
    getPurchaseableElements: (owned: Element[]) => PurchaseableElement[];
    getPurchaseableTargets: (owned: Element[]) => PurchaseableTarget[];
    getRerollCost: (numRerolls: number) => Cost;
    getIncrementCost: (numIncrements: number) => Cost;
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
                <div>Money: <CostComponent cost={money} /></div>
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
                                {buyText} (<CostComponent cost={price} />)
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
                        Buy reroll (<CostComponent cost={nextRerollCost} />)
                    </button>
                    <button
                        disabled={!canAfford(money, nextIncrementCost)}
                        onClick={() => {
                            updateMoney(nextIncrementCost, 'loss');
                            setIncrements(current => current + 1);
                        }}
                    >
                        Buy increment (<CostComponent cost={nextIncrementCost} />)
                    </button>
                    <button
                        disabled={!canAfford(money, AUTOMATION_COST) || automationEnabled}
                        onClick={() => {
                            updateMoney(AUTOMATION_COST, 'loss');
                            setAutomationEnabled(true);
                        }}
                    >
                        Buy automation ({automationEnabled ? 'Bought' : <CostComponent cost={AUTOMATION_COST} />})
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
                                        {target.name} (<CostComponent cost={cost} />)
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
