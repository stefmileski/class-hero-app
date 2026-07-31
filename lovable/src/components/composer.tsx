import { useMemo, useState } from "react";

/**
 * Composer — "Paste the newsletter."
 *
 * Opens from the first row of the Add sheet. Paste a newsletter, the app
 * returns the dates, the money and the things to bring as a checklist of
 * hairline squares. The only place the app is chatty is that it isn't.
 *
 * Parsing here is deliberately local and dumb — enough to prove the
 * interaction. Swap `detect()` for a real extractor (server function or an
 * LLM call) without touching the surface.
 */

export type DetectedItem = {
  id: string;
  title: string;
  detail: string;
  selected: boolean;
};

/** Dates, money and times, in the order they appear. */
function detect(text: string): DetectedItem[] {
  if (!text.trim()) return [];

  const DATE =
    /\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?\s+\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b|\b\d{1,2}\/\d{1,2}(\/\d{2,4})?\b/gi;
  const MONEY = /\$\s?\d+(\.\d{2})?\b/g;
  const TIME = /\b\d{1,2}[.:]\d{2}\s?(am|pm)?\b/gi;

  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const out: DetectedItem[] = [];
  lines.forEach((line, idx) => {
    const dates = line.match(DATE) ?? [];
    const money = line.match(MONEY) ?? [];
    const times = line.match(TIME) ?? [];
    if (!dates.length && !money.length && !times.length) return;

    // The title is the line with the matched fragments stripped out.
    const title =
      line
        .replace(DATE, "")
        .replace(MONEY, "")
        .replace(TIME, "")
        .replace(/[·—–-]+\s*$/, "")
        .replace(/\s{2,}/g, " ")
        .trim() || "Item";

    out.push({
      id: `d-${idx}`,
      title,
      detail: [...dates, ...times, ...money].join(" · "),
      // Money and dates are actionable; anything else starts unticked.
      selected: dates.length > 0 || money.length > 0,
    });
  });

  return out;
}

const NUMBER = ["no", "one", "two", "three", "four", "five", "six", "seven"];
function spell(n: number) {
  return NUMBER[n] ?? String(n);
}

export function Composer({
  onCancel,
  onAddToDiary,
}: {
  onCancel: () => void;
  /** Receives only the ticked items. */
  onAddToDiary: (items: DetectedItem[]) => void;
}) {
  const [text, setText] = useState("");
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const detected = useMemo(() => detect(text), [text]);
  const items = detected.map((d) => ({
    ...d,
    selected: overrides[d.id] ?? d.selected,
  }));
  const chosen = items.filter((i) => i.selected);

  return (
    <div
      className="u-screen-enter fixed inset-0 z-50 flex justify-center overflow-y-auto bg-paper"
      data-testid="composer"
    >
      <div className="w-full max-w-[460px] border-x border-hairline px-5 pb-24 pt-6">
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <button
            onClick={onCancel}
            data-testid="composer-cancel"
            className="text-[10px] uppercase tracking-[0.28em] text-ash"
          >
            Cancel
          </button>
          <div className="text-[10px] uppercase tracking-[0.3em] text-ink">New post</div>
          <button
            disabled={chosen.length === 0}
            onClick={() => onAddToDiary(chosen)}
            className="text-[10px] uppercase tracking-[0.28em] text-ink disabled:text-faint"
          >
            Share
          </button>
        </div>

        <div className="pt-8">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the newsletter."
            rows={text ? 8 : 3}
            data-testid="composer-input"
            className="w-full resize-none border-0 bg-transparent p-0 font-display text-[30px] leading-[1.12] text-ink outline-none placeholder:text-faint"
          />
          <p className="mt-4 text-[13px] font-light leading-[1.7] text-ash">
            We will find the dates, the money and the things to bring.
          </p>
        </div>

        {items.length > 0 && (
          <>
            <div className="mt-8 border-t border-hairline pt-6 text-[10px] uppercase tracking-[0.3em] text-ash">
              Detected · {spell(items.length)} item{items.length === 1 ? "" : "s"}
            </div>

            <div className="mt-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  data-testid="composer-item"
                  aria-pressed={item.selected}
                  onClick={() =>
                    setOverrides((o) => ({ ...o, [item.id]: !item.selected }))
                  }
                  className="flex w-full items-start gap-4 border-t border-hairline-soft py-5 text-left"
                >
                  <span
                    className="mt-[3px] h-[15px] w-[15px] shrink-0 border"
                    style={{
                      borderColor: item.selected ? "#0E0E0E" : "rgba(14,14,14,.3)",
                      background: item.selected ? "#0E0E0E" : "transparent",
                    }}
                  />
                  <span className="flex flex-col gap-1.5">
                    <span
                      className={`text-[11px] uppercase tracking-[0.26em] ${item.selected ? "text-ink" : "text-ash"}`}
                    >
                      {item.title}
                    </span>
                    <span
                      className={`text-[13px] font-light ${item.selected ? "text-graphite" : "text-ash"}`}
                    >
                      {item.detail}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <button
              disabled={chosen.length === 0}
              onClick={() => onAddToDiary(chosen)}
              data-testid="composer-submit"
              className="mt-8 w-full border border-ink px-5 py-4 text-[11px] uppercase tracking-[0.3em] text-ink disabled:border-hairline disabled:text-faint"
            >
              Add {spell(chosen.length)} to diary
            </button>
          </>
        )}

        {text.trim() && items.length === 0 && (
          <p className="mt-10 text-center text-[10px] uppercase tracking-[0.3em] text-faint">
            Nothing found
          </p>
        )}
      </div>
    </div>
  );
}
