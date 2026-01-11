import type { Target } from './types';
import { countValue, hasFullHouse, hasNOfAKind, hasRunOfLength, sumValues } from './value-utils';

export const FULL_YAHTZEE_GAME: Target[] = [
    {
        id: 'ones',
        name: 'Aces',
        scorer: countValue(1),
    },
    {
        id: 'twos',
        name: 'Twos',
        scorer: countValue(2),
    },
    {
        id: 'threes',
        name: 'Threes',
        scorer: countValue(3),
    },
    {
        id: 'fours',
        name: 'Fours',
        scorer: countValue(4),
    },
    {
        id: 'fives',
        name: 'Fives',
        scorer: countValue(5),
    },
    {
        id: 'sixes',
        name: 'Sixes',
        scorer: countValue(6),
    },
    {
        id: 'chance',
        name: 'Chance',
        scorer: values => sumValues(values),
    },
    {
        id: 'three-of-a-kind',
        name: 'Three of a kind',
        scorer: values => hasNOfAKind(3, values) ? sumValues(values) : 0,
    },
    {
        id: 'four-of-a-kind',
        name: 'Four of a kind',
        scorer: values => hasNOfAKind(4, values) ? sumValues(values) : 0,
    },
    {
        id: 'full-house',
        name: 'Full house',
        scorer: values => hasFullHouse(values) ? 25 : 0,
    },
    {
        id: 'small-straight',
        name: 'Small straight',
        scorer: values => hasRunOfLength(4, values) ? 30 : 0,
    },
    {
        id: 'long-straight',
        name: 'Long straight',
        scorer: values => hasRunOfLength(5, values) ? 40 : 0,
    },
    {
        id: 'five-of-a-kind',
        name: 'Yahtzee',
        scorer: values => hasNOfAKind(5, values) ? 50 : 0,
    },
];