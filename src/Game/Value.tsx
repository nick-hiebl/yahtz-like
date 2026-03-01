import { type Element, type Value, isNumberValue } from '../types';

import './Game.css';

type ValueComponentProps = {
    value: Value;
    type: Element['type'];
    size?: 'medium' | 'small';
};

const KNOWN_SYMBOLS = ['wheat', 'sheep', 'wood', 'brick', 'rock'];

export const ValueComponent = ({ value, size, type }: ValueComponentProps) => {
    const sizeClasses = size === 'small' ? 'small' : '';

    if (type === 'coin') {
        return (
            <div className={`coin-value ${sizeClasses}`}>
                <span>{value.type === 'wild' ? 'W' : value.value}</span>
            </div>
        );
    }

    if (isNumberValue(value)) {
        return (
            <div className={`dice-value ${sizeClasses}`}>
                <span>{value.value}</span>
            </div>
        );
    } else if (value.type === 'wild') {
        return (
            <div className={`dice-value ${sizeClasses}`}>
                <span>W</span>
            </div>
        );
    } else if (value.type === 'symbol' && KNOWN_SYMBOLS.includes(value.value)) {
        const height = size === 'small' ? 20 : 28;
        return (
            <div className={`dice-value ${sizeClasses}`}>
                <img src={`./yahtz-like/assets/${value.value}.png`} height={height} alt={value.value} />
            </div>
        )
    }

    return (
        <div className={`dice-value ${sizeClasses}`}>
            <span>???</span>
        </div>
    );
};