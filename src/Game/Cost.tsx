import type { Cost, MoneyTypes } from '../types';

type IndividualCostProps = {
    moneyType: MoneyTypes;
    amount: number;
};

const IndividualCost = ({ amount, moneyType }: IndividualCostProps) => {
    if (moneyType === 'dollar') {
        return <span>${amount}</span>;
    } else if (moneyType === 'rocket') {
        return <span>{amount} ROCKET</span>;
    }
    return null;
};

type CostComponentProps = {
    cost: Cost;
};

export const CostComponent = ({ cost }: CostComponentProps) => {
    return (
        <span>
            {(Object.entries(cost) as [MoneyTypes, number][])
                .filter(([, a]) => a > 0)
                .map(([type, amount]) => (
                    <IndividualCost amount={amount} moneyType={type} key={type} />
                ))}
        </span>
    );
};
