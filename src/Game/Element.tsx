import type { Element } from '../types';

import { ValueComponent } from './Value';

export const ElementComponent = ({ element }: { element: Element }) => {
    if (element.type === 'dice') {
        return <ValueComponent type="dice" value={element.maxValue} />
    } else if (element.type === 'coin') {
        return <ValueComponent type="coin" value={element.values[0]} />
    }

    return <span>???</span>;
};