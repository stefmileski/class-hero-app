import type { Screen } from '../types';
import {
  CanteenIcon,
  CommunityIcon,
  FeedIcon,
  PlusIcon,
  ProfileIcon,
} from './Icons';

interface TabBarProps {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
}

const TABS = [
  { key: 'feed', label: 'Feed' },
  { key: 'community', label: 'Community' },
  { key: 'add', label: 'Add' },
  { key: 'canteen', label: 'Canteen' },
  { key: 'profile', label: 'Profile' },
] as const satisfies ReadonlyArray<{ key: Screen; label: string }>;

/**
 * Five destinations, 52px apiece. Active ink, inactive ash. Add is the one
 * accent in the whole bar: a plus inside a 34px hairline square.
 */
export function TabBar({ screen, onNavigate }: TabBarProps) {
  return (
    <nav className="tabbar" aria-label="Primary">
      {TABS.map((tab) => {
        const active = screen === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            className={active ? 'tab tab--active' : 'tab'}
            aria-current={active ? 'page' : undefined}
            onClick={() => onNavigate(tab.key)}
          >
            {tab.key === 'feed' && <FeedIcon />}
            {tab.key === 'community' && <CommunityIcon />}
            {tab.key === 'add' && (
              <span className="tab__add">
                <PlusIcon />
              </span>
            )}
            {tab.key === 'canteen' && <CanteenIcon />}
            {tab.key === 'profile' && <ProfileIcon />}
            <span className="tab__label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
