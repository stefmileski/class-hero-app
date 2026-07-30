import { ChatIcon } from '../components/Icons';
import { Placeholder } from '../components/Placeholder';
import { GROUPS } from '../data/stories';
import type { Screen } from '../types';

interface FeedProps {
  onNavigate: (screen: Screen) => void;
  onOpenStory: (groupIndex: number) => void;
  seen: string[];
}

/**
 * 2. Feed — Instagram's structure held to the house restraint. Stories rail,
 * posts separated by hairlines, imagery bleeding edge to edge.
 */
export function Feed({ onNavigate, onOpenStory, seen }: FeedProps) {
  return (
    <div className="screen">
      <header className="hdr hdr--ruled">
        <div className="feed__gutter" />
        <div className="display feed__wordmark">CLASS HERO</div>
        <button
          type="button"
          onClick={() => onNavigate('community')}
          aria-label="Messages"
        >
          <ChatIcon />
        </button>
      </header>

      <div className="rail">
        {GROUPS.map((group, i) => {
          const isSeen = seen.includes(group.id);
          return (
            <button
              key={group.id}
              type="button"
              className={isSeen ? 'rail__item rail__item--seen' : 'rail__item'}
              onClick={() => onOpenStory(i)}
            >
              <span className="rail__ring">{group.monogram}</span>
              <span className="rail__label">{group.label}</span>
            </button>
          );
        })}
      </div>

      {/* (a) School post — full-bleed image below the copy. */}
      <article className="post">
        <div className="post__meta">
          <div className="eyebrow">Northbridge Primary</div>
          <div className="meta">2d</div>
        </div>
        <h2 className="display post__title">Book Week Parade</h2>
        <p className="body">
          Friday, 8.40 in the hall. A character from a book. No superheroes.
        </p>
      </article>
      <Placeholder ratio="402 / 452" caption="Book Week · 4:5" />
      <div className="actions">
        <button type="button">Save</button>
        <button type="button">Diary</button>
        <button type="button">Reply</button>
      </div>

      {/* (b) Text-only post — set large in Didone, no card dressing. */}
      <article className="post post--tall">
        <div className="post__meta">
          <div className="eyebrow">Year 3 · Mrs Alder</div>
          <div className="meta">5h</div>
        </div>
        <h2 className="display post__title post__title--large">
          Library books
          <br />
          return Thursday.
        </h2>
        <p className="body">Six of twenty-four are still out. Bags at the door, please.</p>
        <div className="actions actions--inline">
          <button type="button">Save</button>
          <button type="button" onClick={() => onNavigate('tomorrow')}>
            Diary
          </button>
          <button type="button" onClick={() => onNavigate('chat')}>
            Reply
          </button>
        </div>
      </article>

      {/* (c) Canteen post — 1:1 crop. */}
      <article className="post post--canteen">
        <div className="post__meta">
          <div className="eyebrow">Canteen</div>
          <div className="meta">1d</div>
        </div>
        <h2 className="display post__title post__title--small">
          Winter menu, six additions
        </h2>
      </article>
      <Placeholder ratio="1 / 1" caption="Canteen · 1:1" />
      <div className="actions actions--last">
        <button type="button">Save</button>
        <button type="button" onClick={() => onNavigate('canteen')}>
          Order
        </button>
        <button type="button">Reply</button>
      </div>
    </div>
  );
}
