import { useCallback, useState } from 'react';

import { addMoney, invertCost } from './money-utils';
import { type Cost } from './types';

import './App.css';
import { BasicGame } from './ConfiguredGames/basic';

function App() {
    const [isSecondShown, setSecondShown] = useState(true);

    const [money, setMoney] = useState({ dollar: 0, rocket: 0 });

    const updateMoney = useCallback((delta: Cost, direction: 'gain' | 'loss') => {
        setMoney(currentMoney => addMoney(
            currentMoney,
            direction === 'gain' ? delta : invertCost(delta),
        ));
    }, []);

    return (
        <div className="App">
            <BasicGame money={money} updateMoney={updateMoney} />
            <label>
                <input type="checkbox" checked={isSecondShown} onChange={e => setSecondShown(e.currentTarget.checked)} />
                Is second shown?
            </label>
            <div data-hidden={!isSecondShown}>
                <BasicGame money={money} updateMoney={updateMoney} />
            </div>
        </div>
    );
}

export default App;
