import { type Element, type Value, isNumberValue } from '../types';

import './Game.css';

type ValueComponentProps = {
    value: Value;
    type: Element['type'];
    size?: 'medium' | 'small';
};

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
    }

    return (
        <div className={`dice-value ${sizeClasses}`}>
            <span>???</span>
        </div>
    );
};