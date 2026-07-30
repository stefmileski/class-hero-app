import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { GROUPS } from '../data/stories';
import type { Stories } from '../state/useStories';

interface StoryViewerProps {
  stories: Stories;
  /** "View full post" — closes the viewer and lands on the feed. */
  onOpenPost: () => void;
}

/** Gesture thresholds, in px. */
const SWIPE_X = 45;
const SWIPE_DOWN = 70;
/** Tap zone: the left third goes back, the rest advances. */
const BACK_ZONE = 0.32;

/**
 * Signature interaction #1 — the full-screen story viewer.
 *
 * Ink curtain up from the bottom, segmented progress across the top, content
 * bottom-anchored. Tap right to advance, left third to go back, swipe
 * left/right for the next group, swipe down to close.
 */
export function StoryViewer({ stories, onOpenPost }: StoryViewerProps) {
  const { gi, ii, progress, advance, back, nextGroup, prevGroup, close, setPaused } =
    stories;

  const group = GROUPS[gi] ?? GROUPS[0];
  const item = group.items[Math.min(ii, group.items.length - 1)];

  const start = useRef<{ x: number; y: number } | null>(null);
  const [dragY, setDragY] = useState(0);

  // Desktop affordances. The gestures are the spec; these mirror them.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') advance();
      else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, back, close]);

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    // Let the footer and Close buttons have the gesture. Capturing the pointer
    // here would retarget the pointer *and* the compatibility mouse events to
    // the surface, so those buttons would never see their click.
    if ((e.target as HTMLElement).closest('button')) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY };
    setPaused(true);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!start.current) return;
    const dy = e.clientY - start.current.y;
    const dx = e.clientX - start.current.x;
    setDragY(dy > 0 && Math.abs(dy) > Math.abs(dx) ? dy : 0);
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const from = start.current;
    start.current = null;
    setDragY(0);
    setPaused(false);
    if (!from) return;

    const dx = e.clientX - from.x;
    const dy = e.clientY - from.y;

    if (dy > SWIPE_DOWN && Math.abs(dy) > Math.abs(dx)) return close();
    if (dx < -SWIPE_X) return nextGroup();
    if (dx > SWIPE_X) return prevGroup();

    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX - rect.left < rect.width * BACK_ZONE) back();
    else advance();
  }

  function onPointerCancel() {
    start.current = null;
    setDragY(0);
    setPaused(false);
  }

  return (
    <div className="story" role="dialog" aria-modal="true" aria-label={`${group.author} stories`}>
      <div
        className={dragY ? 'story__surface story__surface--dragging' : 'story__surface'}
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          opacity: dragY ? Math.max(0.4, 1 - dragY / 420) : undefined,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        <div className="story__progress">
          {group.items.map((_, i) => (
            <div className="story__track" key={i}>
              <div
                className="story__fill"
                style={{
                  width:
                    i < ii ? '100%' : i === ii ? `${Math.min(1, progress) * 100}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        <div className="story__header">
          <div className="story__author">
            <div className="story__monogram">{group.monogram}</div>
            <div className="story__byline">
              <div className="story__source">{group.author}</div>
              <div className="story__ago">{item.ago}</div>
            </div>
          </div>
          <button type="button" className="story__close" onClick={close}>
            Close
          </button>
        </div>

        <div className="story__content">
          {item.image ? <div className="story__image">Image · 4:5</div> : null}
          <div className="story__copy">
            <div className="story__eyebrow-row">
              <div className="story__accent" style={{ background: item.accent }} />
              <div className="story__eyebrow" style={{ color: item.accent }}>
                {item.eyebrow}
              </div>
            </div>
            <div className="story__title display">{item.title}</div>
            <div className="story__body">{item.body}</div>
          </div>
        </div>

        <div className="story__footer">
          {item.post ? (
            <button
              type="button"
              className="story__post"
              onClick={onOpenPost}
            >
              View full post
            </button>
          ) : null}
          <div className="story__hint">Swipe across · swipe down to close</div>
        </div>
      </div>
    </div>
  );
}
