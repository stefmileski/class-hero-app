import { MenuIcon } from '../components/Icons';
import { Placeholder } from '../components/Placeholder';
import type { Screen } from '../types';

interface ProfileProps {
  onNavigate: (screen: Screen) => void;
  consent: boolean;
}

/**
 * 9. Profile — the child switcher is the stories rail, promoted. Three
 * hairline stat columns, then the 3-up grid to the screen edge.
 */
export function Profile({ onNavigate, consent }: ProfileProps) {
  const word = consent ? 'Granted' : 'Withheld';
  const colour = consent ? 'var(--fern)' : 'var(--oxide)';

  return (
    <div className="screen">
      <header className="prof__head">
        <div className="eyebrow">The Marchettis</div>
        <MenuIcon />
      </header>

      <div className="switcher">
        <div className="switcher__child switcher__child--active">
          <div className="switcher__ring" />
          <div className="switcher__label">Ivy</div>
        </div>
        <div className="switcher__child switcher__child--muted">
          <div className="switcher__ring" />
          <div className="switcher__label">Otto</div>
        </div>
        <div className="switcher__child switcher__child--muted">
          <div className="switcher__ring switcher__ring--add">+</div>
          <div className="switcher__label">Add</div>
        </div>
      </div>

      <div className="prof__name">
        <h1 className="display prof__name-text">Ivy Marchetti</h1>
        <div className="eyebrow eyebrow--ash">Year 3 · Mrs Alder · Northbridge</div>
      </div>

      <div className="stats">
        <button type="button" className="stat" onClick={() => onNavigate('tomorrow')}>
          <span className="display stat__value">4</span>
          <span className="stat__label">Diary</span>
        </button>
        <button type="button" className="stat" onClick={() => onNavigate('vault')}>
          <span className="display stat__value">128</span>
          <span className="stat__label">Vault</span>
        </button>
        <div className="stat">
          <span className="display stat__value">2</span>
          <span className="stat__label">Replies</span>
        </div>
      </div>

      <div>
        <button type="button" className="setting" onClick={() => onNavigate('vault')}>
          <span className="row-title">Photo consent</span>
          <span className="setting__value setting__value--state" style={{ color: colour }}>
            {word}
          </span>
        </button>
        <div className="setting">
          <span className="row-title">Medical &amp; allergies</span>
          <span className="setting__value">Peanut</span>
        </div>
        <button type="button" className="setting" onClick={() => onNavigate('canteen')}>
          <span className="row-title">Canteen account</span>
          <span className="setting__value">$32.10</span>
        </button>
      </div>

      <div className="photo-grid prof__grid">
        {Array.from({ length: 6 }, (_, i) => (
          <Placeholder key={i} />
        ))}
      </div>
    </div>
  );
}
