import { Placeholder } from '../components/Placeholder';

interface ComposerProps {
  onCancel: () => void;
  onAddToDiary: () => void;
}

const DETECTED = [
  { title: 'Book Week parade', detail: 'Fri 1 Aug · 8.40am · Hall', selected: true },
  { title: 'Excursion payment', detail: '$14.50 · due Wed 6 Aug', selected: true },
  { title: 'Working bee', detail: 'Sat 9 Aug · optional', selected: false },
];

/**
 * 7. Composer — paste a newsletter, we return dates. The parse result is a
 * checklist of hairline squares.
 */
export function Composer({ onCancel, onAddToDiary }: ComposerProps) {
  return (
    <div className="screen">
      <header className="hdr hdr--ruled hdr--deep">
        <button type="button" className="nav-action" onClick={onCancel}>
          Cancel
        </button>
        <div className="eyebrow">New post</div>
        <div className="nav-action nav-action--ink">Share</div>
      </header>

      <div className="comp__prompt">
        <div className="display comp__paste">Paste the newsletter.</div>
        <div className="comp__explain">
          We will find the dates, the money and the things to bring.
        </div>
      </div>

      <div className="rule comp__rule" />

      <div className="eyebrow eyebrow--ash comp__detected">Detected · three items</div>

      <div>
        {DETECTED.map((entry, i) => (
          <div
            key={entry.title}
            className={[
              'check',
              entry.selected ? '' : 'check--off',
              i === DETECTED.length - 1 ? 'check--last' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className={entry.selected ? 'check__box' : 'check__box check__box--off'} />
            <div className="check__text">
              <div className="row-title">{entry.title}</div>
              <div className="check__detail">{entry.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="attach">
        <Placeholder className="attach__slot" />
        <div className="attach__add">+</div>
        <div className="attach__label">Attach</div>
      </div>

      <div className="comp__cta">
        <button type="button" className="btn-outline" onClick={onAddToDiary}>
          Add two to diary
        </button>
      </div>
    </div>
  );
}
