import { getRandomListItem } from '../random';
import { Roll, Target } from '../types';

import { Action } from './types';

export const gameAutomation = (
    rolls: Roll[],
    targets: Target[],
    rerollsLeft: number,
): Action => {
    if (targets.length === 0) {
        throw new Error('Asked to automate when 0 targets are available!');
    }

    const values = rolls.map(roll => roll.value);

    const highestScoringTarget = targets.reduce<{ score: number; id: string } | null>((best, currentTarget) => {
        const currentScore = currentTarget.scorer(values);

        if (!best) {
            if (currentScore > 0) {
                return { score: currentScore, id: currentTarget.id };
            }

            return null;
        }

        if (currentScore > best.score) {
            return { score: currentScore, id: currentTarget.id };
        } else {
            return best;
        }
    }, null);

    if (!highestScoringTarget) {
        if (rerollsLeft > 0) {
            return { type: 'reroll' };
        }
        return {
            type: 'target',
            id: getRandomListItem(targets).id,
        };
    } else {
        return {
            type: 'target',
            id: highestScoringTarget.id,
        };
    }
};
