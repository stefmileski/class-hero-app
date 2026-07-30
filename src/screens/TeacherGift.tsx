interface TeacherGiftProps {
  onBack: () => void;
}

const CONTRIBUTORS = [
  { name: 'Priya S.', amount: '$20' },
  { name: 'The Marchettis', amount: '$20' },
  { name: 'D. Okafor', amount: '$20' },
];

/**
 * 11. Teacher gift — anonymous by design. Progress is one 2px rule,
 * contributors are a plain ledger, the amount is set in Didone so it reads as
 * a figure rather than a target.
 */
export function TeacherGift({ onBack }: TeacherGiftProps) {
  return (
    <div className="screen">
      <header className="gift__head">
        <button type="button" className="nav-action" onClick={onBack}>
          Back
        </button>
        <div className="nav-action">Anonymous</div>
      </header>

      <div className="gift__title-block">
        <div className="eyebrow eyebrow--ash">End of year · Year 3</div>
        <h1 className="display gift__title">Mrs Alder</h1>
      </div>

      <div className="gift__progress">
        <div className="gift__figures">
          <div className="display gift__amount">$240</div>
          <div className="gift__of">of $480 · 12 of 24</div>
        </div>
        <div className="gift__bar">
          <div className="gift__bar-fill" style={{ width: '50%' }} />
        </div>
      </div>

      <div>
        {CONTRIBUTORS.map((entry) => (
          <div className="contrib" key={entry.name}>
            <span>{entry.name}</span>
            <span className="contrib__amount">{entry.amount}</span>
          </div>
        ))}
        <div className="contrib contrib--last">
          <span>Nine others</span>
          <span>$180</span>
        </div>
      </div>

      <div className="gift__cta">
        <button type="button" className="btn-outline">
          Contribute $20
        </button>
        <div className="gift__closes">Closes 11 December</div>
      </div>
    </div>
  );
}
