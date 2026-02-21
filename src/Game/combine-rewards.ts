import type { Cost, MoneyTypes, Reward } from '../types';

export const combineRewards = (rewards: Reward[]): Cost => {
    const tally: Partial<Record<MoneyTypes, number>> = {};
    const multipliers: Partial<Record<MoneyTypes, number>> = {};

    rewards.forEach(reward => {
        if (reward.effect === 'multiplier') {
            multipliers[reward.currency] = (multipliers[reward.currency] ?? 0) + reward.quantity;
        } else {
            tally[reward.currency] = (tally[reward.currency] ?? 0) + reward.quantity;
        }
    });

    const cost: Cost = {};

    (Object.entries(tally) as [MoneyTypes, number][]).forEach(([key, quantity]) => {
        if (key.endsWith('::multiplier')) {
            return;
        }

        const multiplier = (multipliers[key] ?? 0) + 1;

        cost[key] = quantity * multiplier;
    });

    return cost;
};
