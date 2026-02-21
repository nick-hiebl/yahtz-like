import { getRandomListItem } from '../random';
import type { Reward, Roll, Target } from '../types';

import type { Action } from './types';

export const gameAutomation = (
    rolls: Roll[],
    targets: Target[],
    rerollsLeft: number,
): Action => {
    if (targets.length === 0) {
        throw new Error('Asked to automate when 0 targets are available!');
    }

    const values = rolls.map(roll => roll.value);

    const highestScoringTarget = targets.reduce<{ score: Reward[]; simpleTotal: number; id: string } | null>((best, currentTarget) => {
        const currentScore = currentTarget.scorer(values);
        const numTotal = currentScore.reduce((a, b) => a + b.quantity, 0);

        if (!best) {
            if (numTotal > 0) {
                return { score: currentScore, id: currentTarget.id, simpleTotal: numTotal };
            }

            return null;
        }

        if (numTotal > best.simpleTotal) {
            return { score: currentScore, id: currentTarget.id, simpleTotal: numTotal };
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
