import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

/**
 * Story Viewer — signature surface of the monochrome redesign.
 *
 * Full-screen ink overlay that slides up as a 380ms curtain, inset below the
 * status bar. Segmented progress bars fill over 6.5s per card and
 * auto-advance. Tap right ⅔ = next card, tap left ⅓ = previous, swipe
 * left/right (>45px) = next/previous group, swipe down (>70px) = close.
 * Timer pauses while the pointer is down. End of everything = close.
 *
 * Changes from the previous revision, all against design/SPEC.md:
 *  - Tapping back on the very first card no longer dismisses the viewer.
 *  - "View full post" returns for cards that link to a public post.
 *  - The accent line sits inline with the eyebrow, not stacked above it.
 *  - The rail shows a short `label` ("School") rather than a truncated author
 *    ("Northbrid…").
 *  - data-testid hooks so the Playwright suite has stable selectors.
 */

export type StoryItem = {
  id: string;
  eyebrow: string;
  title: string;
  body?: string;
  accent?: "fern" | "oxide" | "brass" | "neutral";
  imageUrl?: string | null;
  /**
   * Where "View full post" goes. Only set it for content that was publicly
   * posted — a consented photograph of one child is not a public post, and
   * must not offer the link.
   */
  postTo?: string;
  postParams?: Record<string, string>;
};

export type StoryGroup = {
  id: string;
  monogram: string;
  author: string;
  /**
   * Short rail caption — "School", "Canteen", "Year 3". Falls back to the
   * author, but prefer setting it: the rail has room for about nine
   * characters and the design calls for a word, not a truncation.
   */
  label?: string;
  age?: string;
  items: StoryItem[];
};

const CARD_MS = 6500;
const ACCENTS: Record<NonNullable<StoryItem["accent"]>, string> = {
  fern: "#8FB49F",
  oxide: "#C46A6A",
  brass: "#D8B871",
  neutral: "rgba(255,255,255,.62)",
};

const SEEN_KEY = "ch-stories-seen";

export function readSeenGroups(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function markSeen(id: string) {
  try {
    const s = readSeenGroups();
    s.add(id);
    localStorage.setItem(SEEN_KEY, JSON.stringify([...s]));
  } catch {
    /* private mode — non-fatal */
  }
}

export function StoryViewer({
  groups,
  startGroup = 0,
  onClose,
}: {
  groups: StoryGroup[];
  startGroup?: number;
  onClose: () => void;
}) {
  const [g, setG] = useState(startGroup);
  const [i, setI] = useState(0);
  const [progress, setProgress] = useState(0);
  const paused = useRef(false);
  const raf = useRef(0);
  const started = useRef(0);
  const elapsedAtPause = useRef(0);
  const touch = useRef<{ x: number; y: number; t: number } | null>(null);

  const group = groups[g];
  const item = group?.items[i];

  useEffect(() => {
    if (group) markSeen(group.id);
  }, [group]);

  const advance = useCallback(
    (dir: 1 | -1) => {
      setProgress(0);
      elapsedAtPause.current = 0;
      if (!group) return;
      const ni = i + dir;
      if (ni >= 0 && ni < group.items.length) {
        setI(ni);
        return;
      }
      const ng = g + dir;
      if (ng >= 0 && ng < groups.length) {
        setG(ng);
        setI(dir === 1 ? 0 : Math.max(0, groups[ng].items.length - 1));
        return;
      }
      // Running off the end hands the reader back to the feed. Running off the
      // *start* is simply nothing to go back to — it must not dismiss.
      if (dir === 1) onClose();
    },
    [g, i, group, groups, onClose],
  );

  const jumpGroup = useCallback(
    (dir: 1 | -1) => {
      setProgress(0);
      elapsedAtPause.current = 0;
      const ng = g + dir;
      if (ng >= 0 && ng < groups.length) {
        setG(ng);
        setI(0);
        return;
      }
      // Same asymmetry: swiping past the last group closes, past the first
      // holds where it is.
      if (dir === 1) onClose();
    },
    [g, groups.length, onClose],
  );

  // rAF-driven card timer for smooth fills, paused while held.
  useEffect(() => {
    started.current = performance.now() - elapsedAtPause.current;
    const tick = (now: number) => {
      if (!paused.current) {
        const el = now - started.current;
        if (el >= CARD_MS) {
          advance(1);
          return;
        }
        setProgress(el / CARD_MS);
      } else {
        started.current = now - elapsedAtPause.current;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g, i]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") advance(1);
      else if (e.key === "ArrowLeft") advance(-1);
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose, advance]);

  const accent = ACCENTS[item?.accent ?? "neutral"];

  const pointerDown = (e: React.PointerEvent) => {
    paused.current = true;
    elapsedAtPause.current = performance.now() - started.current;
    touch.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  };

  const pointerUp = (e: React.PointerEvent) => {
    paused.current = false;
    const t0 = touch.current;
    touch.current = null;
    if (!t0) return;
    const dx = e.clientX - t0.x;
    const dy = e.clientY - t0.y;
    if (dy > 70 && Math.abs(dy) > Math.abs(dx)) return onClose();
    if (dx < -45) return jumpGroup(1);
    if (dx > 45) return jumpGroup(-1);
    if (Date.now() - t0.t < 400 && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      // The surface spans the window, so the window is the right basis here.
      const frac = e.clientX / window.innerWidth;
      if (frac < 1 / 3) advance(-1);
      else advance(1);
    }
  };

  const bars = useMemo(() => group?.items ?? [], [group]);

  if (!group || !item) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-label={`Stories — ${group.author}`}
      data-testid="story"
      style={{ background: "rgba(0,0,0,.4)" }}
    >
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col overflow-hidden bg-ink text-paper"
        style={{
          top: 56,
          animation: "ch-curtain 380ms cubic-bezier(.2,.7,.2,1) both",
        }}
        onPointerDown={pointerDown}
        onPointerUp={pointerUp}
      >
        <style>{`@keyframes ch-curtain{from{transform:translateY(100%)}to{transform:translateY(0)}}
@media (prefers-reduced-motion:reduce){[data-ch-curtain]{animation:none!important}}`}</style>

        {/* segmented progress */}
        <div className="flex gap-1.5 px-5 pt-4" data-testid="story-progress">
          {bars.map((b, idx) => (
            <div
              key={b.id}
              className="h-[1.5px] flex-1"
              data-testid="story-track"
              style={{ background: "rgba(255,255,255,.28)" }}
            >
              <div
                className="h-full bg-paper"
                data-testid="story-fill"
                style={{
                  width:
                    idx < i ? "100%" : idx === i ? `${progress * 100}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* header */}
        <div className="flex items-center gap-3 px-5 pt-4">
          <div
            className="grid h-8 w-8 place-items-center rounded-full font-display text-[13px]"
            style={{ background: "rgba(255,255,255,.16)" }}
          >
            {group.monogram}
          </div>
          <div
            className="text-[9px] uppercase tracking-[0.28em] text-paper"
            data-testid="story-author"
          >
            {group.author}
          </div>
          {group.age && (
            <div
              className="text-[9px] uppercase tracking-[0.28em]"
              style={{ color: "rgba(255,255,255,.5)" }}
            >
              {group.age}
            </div>
          )}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={onClose}
            data-testid="story-close"
            className="ml-auto text-[9px] uppercase tracking-[0.28em] text-paper"
          >
            Close
          </button>
        </div>

        {/* optional image area */}
        {item.imageUrl && (
          <div className="mt-6 px-5">
            <div
              className="aspect-[4/5] w-full overflow-hidden"
              style={{ background: "#1A1A1A" }}
            >
              <img
                src={item.imageUrl}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        )}

        {/* bottom-anchored content */}
        <div className="mt-auto px-5 pb-10">
          {/* accent line and eyebrow sit on one line, 26x2px then 12px gap */}
          <div className="flex items-center gap-3">
            <span
              className="h-[2px] w-[26px] shrink-0"
              data-testid="story-accent"
              style={{ background: accent }}
            />
            <span
              className="text-[9px] uppercase tracking-[0.32em]"
              data-testid="story-eyebrow"
              style={{ color: accent }}
            >
              {item.eyebrow}
            </span>
          </div>

          <div
            className="mt-3 font-display text-[38px] leading-[1.05] text-paper"
            data-testid="story-title"
          >
            {item.title}
          </div>
          {item.body && (
            <p
              className="mt-3 max-w-[300px] text-[14px] font-light leading-[1.7]"
              style={{ color: "rgba(255,255,255,.62)" }}
            >
              {item.body}
            </p>
          )}

          {/* Only for content that was publicly posted. */}
          {item.postTo && (
            <Link
              to={item.postTo}
              params={item.postParams as never}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={onClose}
              data-testid="story-post"
              className="mt-8 block w-full border px-5 py-4 text-center text-[10px] uppercase tracking-[0.3em] text-paper"
              style={{ borderColor: "rgba(255,255,255,.55)" }}
            >
              View full post
            </Link>
          )}

          <div
            className="mt-8 text-center text-[9px] uppercase tracking-[0.28em]"
            style={{ color: "rgba(255,255,255,.35)" }}
          >
            Swipe across · swipe down to close
          </div>
        </div>
      </div>
    </div>
  );
}

/** Stories rail — 58px bone circles with Bodoni monograms. */
export function StoriesRail({
  groups,
  onOpen,
}: {
  groups: StoryGroup[];
  onOpen: (index: number) => void;
}) {
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    setSeen(readSeenGroups());
  }, [groups]);

  if (groups.length === 0) return null;

  return (
    <div
      className="-mx-5 flex gap-4 overflow-x-auto border-b border-hairline px-5 pb-5 pt-1"
      data-testid="rail"
    >
      {groups.map((gr, idx) => {
        const isSeen = seen.has(gr.id);
        // Prefer the short label; only fall back to a truncated author.
        const caption =
          gr.label ??
          (gr.author.length > 9 ? gr.author.slice(0, 8) + "…" : gr.author);
        return (
          <button
            key={gr.id}
            onClick={() => onOpen(idx)}
            data-testid="rail-item"
            data-seen={isSeen ? "true" : "false"}
            className="flex shrink-0 flex-col items-center gap-2.5"
          >
            <span
              className="grid h-[58px] w-[58px] place-items-center rounded-full bg-bone font-display text-[17px] text-ink"
              style={
                isSeen
                  ? { border: "1px solid rgba(14,14,14,.14)" }
                  : {
                      border: "1px solid #0E0E0E",
                      outline: "1px solid #0E0E0E",
                      outlineOffset: 4,
                    }
              }
            >
              {gr.monogram}
            </span>
            <span
              className={`text-[9px] uppercase tracking-[0.2em] ${isSeen ? "text-ash" : "text-ink"}`}
            >
              {caption}
            </span>
          </button>
        );
      })}
    </div>
  );
}
