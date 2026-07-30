interface ThreadProps {
  onBack: () => void;
}

/**
 * 6. Thread — teacher messages sit in bone; yours sit in ink and align right.
 * Squared corners keep it out of consumer-messenger territory.
 */
export function Thread({ onBack }: ThreadProps) {
  return (
    <div className="screen">
      <header className="chat__head">
        <button type="button" className="nav-action" onClick={onBack}>
          Back
        </button>
        <div className="chat__title">Mrs Alder</div>
        <div className="chat__gutter" />
      </header>

      <div className="chat__log">
        <div className="chat__day">Today</div>

        <div className="bubble">
          <div className="bubble__sender">Mrs Alder · 8.42</div>
          <div className="bubble__body">
            Ivy read beautifully today. She has asked to take the Roald Dahl home again.
          </div>
        </div>

        <div className="bubble bubble--mine">
          <div className="bubble__sender">You · 9.05</div>
          <div className="bubble__body">
            Thank you. We&apos;ll return the other two Thursday.
          </div>
        </div>

        <div className="bubble">
          <div className="bubble__sender">Mrs Alder · 9.11</div>
          <div className="bubble__body">Perfect.</div>
        </div>
      </div>

      <div className="composer-bar">
        <div className="composer-bar__prompt">Message</div>
        <div className="nav-action">Send</div>
      </div>
    </div>
  );
}
