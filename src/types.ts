export type Screen =
  | 'onboarding'
  | 'feed'
  | 'tomorrow'
  | 'community'
  | 'chat'
  | 'add'
  | 'canteen'
  | 'profile'
  | 'vault'
  | 'gifts';

export interface StoryItem {
  eyebrow: string;
  /** Accent hairline colour — classifies the card on the ink background. */
  accent: string;
  title: string;
  body: string;
  ago: string;
  /** Publicly posted, so the viewer offers "View full post". */
  post: boolean;
  image?: boolean;
}

export interface StoryGroup {
  id: string;
  /** Rail label under the monogram circle. */
  label: string;
  monogram: string;
  author: string;
  items: StoryItem[];
}
