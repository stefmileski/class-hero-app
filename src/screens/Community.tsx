import type { Screen } from '../types';

interface CommunityProps {
  onNavigate: (screen: Screen) => void;
}

/**
 * 5. Community — inbox, notices and the gift fund under one tab. Rows, not
 * bubbles; the gift row carries a brass line because money is due.
 */
export function Community({ onNavigate }: CommunityProps) {
  return (
    <div className="screen">
      <div className="comm__head">
        <h1 className="display comm__title">Community</h1>
      </div>

      <div className="segmented" role="tablist" aria-label="Community sections">
        <div className="segmented__item segmented__item--active" role="tab" aria-selected>
          Messages
        </div>
        <div className="segmented__item" role="tab" aria-selected={false}>
          Notices
        </div>
        <button
          type="button"
          className="segmented__item"
          role="tab"
          aria-selected={false}
          onClick={() => onNavigate('gifts')}
        >
          Gifts
        </button>
      </div>

      <div>
        <button type="button" className="msg" onClick={() => onNavigate('chat')}>
          <span className="msg__avatar msg__avatar--unread" />
          <span className="msg__body">
            <span className="msg__head">
              <span className="row-title">Mrs Alder</span>
              <span className="msg__age">5h</span>
            </span>
            <span className="msg__preview">Ivy read beautifully today.</span>
          </span>
        </button>

        <div className="msg">
          <span className="msg__avatar" />
          <span className="msg__body">
            <span className="msg__head">
              <span className="row-title">Year 3 Parents · 24</span>
              <span className="msg__age">1d</span>
            </span>
            <span className="msg__preview msg__preview--muted">
              Priya: costume swap, anyone?
            </span>
          </span>
        </div>

        <button type="button" className="msg" onClick={() => onNavigate('gifts')}>
          <span className="msg__avatar" />
          <span className="msg__body">
            <span className="msg__head">
              <span className="row-title">Gift · Mrs Alder</span>
              <span className="status-line" style={{ background: 'var(--brass)' }} />
            </span>
            <span className="msg__preview">Twelve of twenty-four in.</span>
          </span>
        </button>

        <div className="msg">
          <span className="msg__avatar" />
          <span className="msg__body">
            <span className="msg__head">
              <span className="row-title">Front office</span>
              <span className="msg__age">3d</span>
            </span>
            <span className="msg__preview msg__preview--muted">
              Absence recorded, 24 July.
            </span>
          </span>
        </div>
      </div>

      <div className="comm__count">Four conversations</div>
    </div>
  );
}
