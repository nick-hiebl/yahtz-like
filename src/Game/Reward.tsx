import type { Reward } from '../types';
import { CostComponent } from './Cost';

type IndividualRewardProps = {
    reward: Reward;
};

const IndividualReward = ({ reward }: IndividualRewardProps) => {
    if (reward.effect === 'multiplier') {
        if (reward.currency === 'rocket') {
            return <span>{reward.quantity + 1}x rockets</span>;
        }

        return <span><CostComponent cost={{ [reward.currency]: reward.quantity + 1 }} />x</span>
    } else {
        return <CostComponent cost={{ [reward.currency]: reward.quantity }} />;
    }
};

type RewardComponentProps = {
    rewards: Reward[];
};

export const RewardComponent = ({ rewards }: RewardComponentProps) => {
    if (rewards.length === 0 || rewards.every(r => r.quantity === 0)) {
        return <span>-</span>;
    }

    return (
        <span>
            {rewards.map((reward, index) => (
                index === 0 ? <IndividualReward reward={reward} /> : (
                    <span>
                        ,&nbsp;
                        <IndividualReward reward={reward} />
                    </span>
                )
            ))}
        </span>
    );
};
