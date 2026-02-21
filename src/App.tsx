import { useCallback, useMemo, useState } from 'react';

import { BasicGame } from './ConfiguredGames/basic';
import { CoinsGame } from './ConfiguredGames/coins';
import { type Tab, Tabs } from './Tabs';
import { addMoney, invertCost } from './money-utils';
import { type Cost } from './types';

import './App.css';

function App() {
    const [money, setMoney] = useState({ dollar: 0, rocket: 0 });

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
                content: <BasicGame money={money} updateMoney={updateMoney} />,
            },
            {
                id: 'coin',
                name: 'Coin',
                content: <CoinsGame money={money} updateMoney={updateMoney} />,
            },
        ];
    }, [money, updateMoney]);

    return (
        <div className="App">
            <Tabs tabs={tabs} />
        </div>
    );
}

export default App;
