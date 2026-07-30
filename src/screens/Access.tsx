interface AccessProps {
  onEnter: () => void;
}

/**
 * 1. Access — a fashion-house cover page. Wordmark, one rule, two fields, one
 * black button. No illustration, no benefit bullets.
 */
export function Access({ onEnter }: AccessProps) {
  return (
    <div className="screen screen--no-tabs access">
      <div className="access__head">
        <h1 className="display access__wordmark">CLASS HERO</h1>
        <div className="access__tagline">School, quietly handled</div>
      </div>

      <div className="rule access__rule" />

      <div className="access__fields">
        <div className="field field--focus">
          <div className="field__label">School</div>
          <div className="field__value">Northbridge Primary</div>
        </div>
        <div className="field">
          <div className="field__label">Invitation code</div>
          <div className="field__value field__value--empty">— — — —</div>
        </div>
      </div>

      <div className="spacer" />

      <div className="access__foot">
        <button type="button" className="btn-ink" onClick={onEnter}>
          Request access
        </button>
        <div className="access__alt">My school is not listed</div>
      </div>
    </div>
  );
}
