import { useCallback, useMemo, useState } from 'react';

import { BasicGame } from './ConfiguredGames/basic';
import { CoinsGame } from './ConfiguredGames/coins';
import { SettlerGame } from './ConfiguredGames/settlers';
import { type Tab, Tabs } from './Tabs';
import { addMoney, invertCost } from './money-utils';
import type { Cost, GameAction } from './types';

import './App.css';

function App() {
    const [money, setMoney] = useState({ dollar: 0, rocket: 0 });
    const [enabledTabs, setEnabledTabs] = useState<Set<string>>(new Set());

    const onGameStateChange = useCallback((action: GameAction): void => {
        if (action.type === 'enable-tab') {
            setEnabledTabs(currentTabs => {
                if (currentTabs.has(action.tabName)) {
                    return currentTabs;
                }

                const newSet = new Set(currentTabs);
                newSet.add(action.tabName);
                return newSet;
            });
        }
    }, []);

    const updateMoney = useCallback((delta: Cost, direction: 'gain' | 'loss') => {
        setMoney(currentMoney => addMoney(
            currentMoney,
            direction === 'gain' ? delta : invertCost(delta),
        ));
    }, []);

    const tabs = useMemo<Tab[]>(() => {
        return [
            {
                id: 'base',
                name: 'Base',
                content: <BasicGame money={money} updateMoney={updateMoney} onGameStateChange={onGameStateChange} />,
            },
            {
                id: 'settler',
                name: 'Settlers',
                content: <SettlerGame money={money} updateMoney={updateMoney} onGameStateChange={onGameStateChange} />,
            },
            {
                id: 'coin',
                name: 'Coin',
                content: <CoinsGame money={money} updateMoney={updateMoney} onGameStateChange={onGameStateChange} />,
            },
        ].filter(game => game.id === 'base' || enabledTabs.has(game.id));
    }, [enabledTabs, money, onGameStateChange, updateMoney]);

    return (
        <div className="App">
            <Tabs tabs={tabs} />
        </div>
    );
}

export default App;
