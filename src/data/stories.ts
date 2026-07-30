import type { StoryGroup } from '../types';

/** Story accents read against the ink background of the viewer. */
export const OXIDE = '#C46A6A'; /* alerts */
export const BRASS = '#D8B871'; /* money, specials, sales */
export const FERN = '#8FB49F'; /* consented memories */
export const PLAIN = 'rgba(255,255,255,.5)';

/** A card holds for 6.5s, stepped every 80ms. */
export const DURATION = 6500;
export const STEP = 80;

export const GROUPS: StoryGroup[] = [
  {
    id: 'school',
    label: 'School',
    monogram: 'N',
    author: 'Northbridge Primary',
    items: [
      {
        eyebrow: 'Alert · today',
        accent: OXIDE,
        title: 'Assembly moved to 2.15',
        body: 'In the hall. Year 3 are performing — parents welcome from 2.10.',
        ago: '40m',
        post: true,
      },
      {
        eyebrow: 'Reminder',
        accent: PLAIN,
        title: 'Book Week parade, Friday 8.40',
        body: 'A character from a book. No superheroes.',
        ago: '40m',
        post: true,
        image: true,
      },
    ],
  },
  {
    id: 'canteen',
    label: 'Canteen',
    monogram: 'C',
    author: 'Canteen',
    items: [
      {
        eyebrow: 'Special · Tuesday',
        accent: BRASS,
        title: 'Pumpkin soup, $4',
        body: 'With a warm roll. Until it runs out.',
        ago: '2h',
        post: true,
        image: true,
      },
      {
        eyebrow: 'Cut-off',
        accent: OXIDE,
        title: 'Orders close 8.30am',
        body: "Tomorrow's menu is open now.",
        ago: '2h',
        post: true,
      },
    ],
  },
  {
    id: 'uniform',
    label: 'Uniform',
    monogram: 'U',
    author: 'Uniform Shop',
    items: [
      {
        eyebrow: 'Sale · Friday',
        accent: BRASS,
        title: 'Winter stock, 30% off',
        body: '8.30 to 10.30 only. Sizes 4 to 12 remain.',
        ago: '5h',
        post: true,
        image: true,
      },
      {
        eyebrow: 'Two days to go',
        accent: PLAIN,
        title: 'Bring the old blazer',
        body: 'Trade-in credit of $10 on any hand-back.',
        ago: '5h',
        post: false,
      },
    ],
  },
  {
    id: 'year3',
    label: 'Year 3',
    monogram: '3',
    author: 'Year 3 · Mrs Alder',
    items: [
      {
        eyebrow: 'Reminder',
        accent: PLAIN,
        title: 'Library books return Thursday',
        body: 'Six of twenty-four are still out. Bags at the door.',
        ago: '5h',
        post: true,
      },
    ],
  },
  {
    id: 'ivy',
    label: 'Ivy',
    monogram: 'I',
    author: 'Ivy · Year 3',
    items: [
      {
        eyebrow: 'Book Week',
        accent: FERN,
        title: 'Costume line-up, 8.40am',
        body: 'Consented for the class page.',
        ago: '1d',
        post: false,
        image: true,
      },
      {
        eyebrow: 'Book Week',
        accent: FERN,
        title: 'The parade, second lap',
        body: 'Consented for the class page.',
        ago: '1d',
        post: false,
        image: true,
      },
    ],
  },
  {
    id: 'otto',
    label: 'Otto',
    monogram: 'O',
    author: 'Otto · Year 1',
    items: [
      {
        eyebrow: 'Swimming',
        accent: FERN,
        title: 'First lap unaided',
        body: 'Consented for the yearbook.',
        ago: '2d',
        post: false,
        image: true,
      },
    ],
  },
];

/** The child's own group, opened by tapping a Vault tile. */
export const IVY_GROUP_INDEX = GROUPS.findIndex((g) => g.id === 'ivy');
