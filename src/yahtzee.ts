import type { Target } from './types';
import { countValue, hasFullHouse, hasNOfAKind, hasRunOfLength, sumValues } from './value-utils';

// export const FULL_YAHTZEE_GAME: Target[] = [
//     {
//         id: 'ones',
//         name: 'Aces',
//         scorer: countValue(1),
//     },
//     {
//         id: 'twos',
//         name: 'Twos',
//         scorer: vs => countValue(2)(vs) * 2,
//     },
//     {
//         id: 'threes',
//         name: 'Threes',
//         scorer: vs => countValue(3)(vs) * 3,
//     },
//     {
//         id: 'fours',
//         name: 'Fours',
//         scorer: vs => countValue(4)(vs) * 4,
//     },
//     {
//         id: 'fives',
//         name: 'Fives',
//         scorer: vs => countValue(5)(vs) * 5,
//     },
//     {
//         id: 'sixes',
//         name: 'Sixes',
//         scorer: vs => countValue(6)(vs) * 6,
//     },
//     {
//         id: 'chance',
//         name: 'Chance',
//         scorer: values => sumValues(values),
//     },
//     {
//         id: 'three-of-a-kind',
//         name: 'Three of a kind',
//         scorer: values => hasNOfAKind(3, values) ? sumValues(values) : 0,
//     },
//     {
//         id: 'four-of-a-kind',
//         name: 'Four of a kind',
//         scorer: values => hasNOfAKind(4, values) ? sumValues(values) : 0,
//     },
//     {
//         id: 'full-house',
//         name: 'Full house',
//         scorer: values => hasFullHouse(values) ? 25 : 0,
//     },
//     {
//         id: 'small-straight',
//         name: 'Small straight',
//         scorer: values => hasRunOfLength(4, values) ? 30 : 0,
//     },
//     {
//         id: 'long-straight',
//         name: 'Long straight',
//         scorer: values => hasRunOfLength(5, values) ? 40 : 0,
//     },
//     {
//         id: 'five-of-a-kind',
//         name: 'Yahtzee',
//         scorer: values => hasNOfAKind(5, values) ? 50 : 0,
//     },
// ];