interface TomorrowProps {
  onClose: () => void;
}

/** Status is a 34×2px coloured line, never a badge. */
const ROWS = [
  { label: 'Canteen order', accent: 'var(--oxide)', detail: 'Otto · cut-off 8.30am' },
  { label: 'Library books', accent: 'var(--brass)', detail: 'Ivy · return by 8.45am' },
  { label: 'Hat', accent: 'var(--hairline)', detail: 'Both · all week' },
  { label: 'Sport uniform', accent: 'var(--hairline)', detail: 'Ivy · Year 3 only' },
];

/**
 * 4. Tomorrow — the whole promise of the app in one screen. A date, four
 * rules, and the words NOTHING ELSE.
 */
export function Tomorrow({ onClose }: TomorrowProps) {
  return (
    <div className="screen">
      <header className="hdr">
        <button type="button" className="nav-action" onClick={onClose}>
          Close
        </button>
        <div className="nav-action">Both children</div>
      </header>

      <div className="tom__hero">
        <h1 className="display tom__title">TOMORROW</h1>
        <div className="eyebrow eyebrow--ash">Wednesday 31 July</div>
      </div>

      <div>
        {ROWS.map((row) => (
          <div className="tom__row" key={row.label}>
            <div className="tom__row-head">
              <div className="item-label">{row.label}</div>
              <div className="status-line" style={{ background: row.accent }} />
            </div>
            <div className="tom__detail">{row.detail}</div>
          </div>
        ))}
      </div>

      <div className="tom__end">Nothing else</div>
    </div>
  );
}
