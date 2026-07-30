import { useCallback, useEffect, useRef, useState } from 'react';
import { DURATION, GROUPS, STEP } from '../data/stories';

interface StoriesState {
  open: boolean;
  /** Group index. */
  gi: number;
  /** Card index within the group. */
  ii: number;
  /** 0–1 through the current card. */
  progress: number;
  seen: string[];
}

const INITIAL: StoriesState = { open: false, gi: 0, ii: 0, progress: 0, seen: [] };

function withSeen(seen: string[], id: string): string[] {
  return seen.includes(id) ? seen : seen.concat(id);
}

/**
 * The stories state machine. A card holds for 6.5s and then auto-advances;
 * running off the end of a group moves to the next, and running off the end of
 * the last group hands the reader back to the feed.
 */
export function useStories() {
  const [state, setState] = useState<StoriesState>(INITIAL);
  const [paused, setPaused] = useState(false);

  const openGroup = useCallback((gi: number) => {
    setState((p) => ({
      open: true,
      gi,
      ii: 0,
      progress: 0,
      seen: withSeen(p.seen, GROUPS[gi].id),
    }));
  }, []);

  const close = useCallback(() => {
    setState((p) => ({ ...p, open: false, progress: 0 }));
    setPaused(false);
  }, []);

  /** Next group, marking the current one seen. Past the last group, closes. */
  const nextGroup = useCallback(() => {
    setState((p) => {
      const seen = withSeen(p.seen, GROUPS[p.gi].id);
      if (p.gi + 1 < GROUPS.length) {
        return { ...p, gi: p.gi + 1, ii: 0, progress: 0, seen };
      }
      return { ...p, open: false, progress: 0, seen };
    });
  }, []);

  const prevGroup = useCallback(() => {
    setState((p) =>
      p.gi > 0
        ? { ...p, gi: p.gi - 1, ii: 0, progress: 0 }
        : { ...p, ii: 0, progress: 0 },
    );
  }, []);

  /** Next card, falling through to the next group at the end of this one. */
  const advance = useCallback(() => {
    setState((p) => {
      if (p.ii + 1 < GROUPS[p.gi].items.length) {
        return { ...p, ii: p.ii + 1, progress: 0 };
      }
      const seen = withSeen(p.seen, GROUPS[p.gi].id);
      if (p.gi + 1 < GROUPS.length) {
        return { ...p, gi: p.gi + 1, ii: 0, progress: 0, seen };
      }
      return { ...p, open: false, progress: 0, seen };
    });
  }, []);

  /** Previous card, falling back to the head of the previous group. */
  const back = useCallback(() => {
    setState((p) => {
      if (p.ii > 0) return { ...p, ii: p.ii - 1, progress: 0 };
      if (p.gi > 0) return { ...p, gi: p.gi - 1, ii: 0, progress: 0 };
      return { ...p, progress: 0 };
    });
  }, []);

  // The timer is driven by an interval so progress and auto-advance stay in
  // step. It pauses while a pointer is down.
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  useEffect(() => {
    if (!state.open || paused) return;
    const id = window.setInterval(() => {
      setState((p) => {
        if (!p.open) return p;
        return { ...p, progress: Math.min(1, p.progress + STEP / DURATION) };
      });
    }, STEP);
    return () => window.clearInterval(id);
  }, [state.open, paused]);

  // Auto-advance once the bar is full. Kept out of the tick's state updater so
  // the updater stays pure and the advance runs exactly once per card.
  useEffect(() => {
    if (!state.open || paused || state.progress < 1) return;
    const id = window.setTimeout(() => advanceRef.current(), 0);
    return () => window.clearTimeout(id);
  }, [state.open, paused, state.progress]);

  return {
    ...state,
    paused,
    setPaused,
    openGroup,
    close,
    advance,
    back,
    nextGroup,
    prevGroup,
  };
}

export type Stories = ReturnType<typeof useStories>;
