interface VaultProps {
  onBack: () => void;
  consent: boolean;
  onToggleConsent: () => void;
  onOpenTile: () => void;
}

const GRANTED =
  'Granted for newsletters, the yearbook and the class page. Revoke at any time and every image hides again.';
const WITHHELD =
  'Withheld. Images of Ivy are hidden here, in the class page and in the yearbook until you grant consent.';

/**
 * 10. Vault — signature interaction #2.
 *
 * Consent is withheld by default: the grid sits under an 18px blur with a
 * single WITHHELD plate. Grant it and the blur resolves over 600ms — and the
 * yearbook, class page and social lines resolve with it.
 *
 * In production the consent flag must gate image delivery server-side. The
 * blur is the UI expression of that, not the mechanism.
 */
export function Vault({ onBack, consent, onToggleConsent, onOpenTile }: VaultProps) {
  const word = consent ? 'Granted' : 'Withheld';
  const colour = consent ? 'var(--fern)' : 'var(--oxide)';

  return (
    <div className="screen">
      <header className="vault__head">
        <button type="button" className="nav-action" onClick={onBack}>
          Back
        </button>
        <div className="nav-action">128 items</div>
      </header>

      <div className="vault__hero">
        <h1 className="display vault__title">THE VAULT</h1>
        <p className="body">
          Every image of Ivy the school holds. Nobody sees it without your word.
        </p>
      </div>

      <div className="vault__panel">
        <div className="vault__panel-row">
          <div className="item-label">Photo consent</div>
          <button
            type="button"
            className="toggle"
            role="switch"
            aria-checked={consent}
            aria-label="Photo consent"
            onClick={onToggleConsent}
          >
            <span className="toggle__knob" />
          </button>
        </div>
        <div className="vault__explain">{consent ? GRANTED : WITHHELD}</div>
      </div>

      <div className="vault__grid-head">
        <div className="eyebrow eyebrow--ash">Book Week · 1 August</div>
        <div className="vault__state" style={{ color: colour }}>
          {word}
        </div>
      </div>

      <div className="vault__grid-wrap">
        <div className={consent ? 'photo-grid vault__grid vault__grid--granted' : 'photo-grid vault__grid'}>
          {Array.from({ length: 9 }, (_, i) => (
            <button
              key={i}
              type="button"
              className="slot"
              onClick={onOpenTile}
              aria-label="Open memory"
            />
          ))}
        </div>
        {consent ? null : (
          <div className="vault__veil">
            <div className="vault__plate">Withheld</div>
          </div>
        )}
      </div>

      <div className="vault__ledger">
        <div className="vault__ledger-note">
          Newsletters · yearbook · class page · social media
        </div>
        <div>
          <div className="channel">
            <span>Yearbook</span>
            <span style={{ color: colour }}>{word}</span>
          </div>
          <div className="channel">
            <span>Class page</span>
            <span style={{ color: colour }}>{word}</span>
          </div>
          <div className="channel channel--last">
            <span>Social media</span>
            <span style={{ color: 'var(--oxide)' }}>Never</span>
          </div>
        </div>
      </div>
    </div>
  );
}
