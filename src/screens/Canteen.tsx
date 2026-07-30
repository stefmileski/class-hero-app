const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const ACTIVE_DAY = 'Tue';

interface MenuItem {
  name: string;
  note: string;
  price: string;
  /** Count in the basket; 0 shows the outlined + stepper. */
  count: number;
}

const HOT: MenuItem[] = [
  { name: 'Chicken & corn roll', note: 'Contains gluten', price: '4.50', count: 0 },
  { name: 'Pumpkin soup', note: 'In basket · 1', price: '4.00', count: 1 },
  { name: 'Sushi, two pieces', note: 'Tuesday only', price: '5.00', count: 0 },
];

const COLD: MenuItem[] = [
  { name: 'Frozen pineapple', note: 'In basket · 1', price: '1.00', count: 1 },
  { name: 'Anzac biscuit', note: 'Contains oats', price: '1.50', count: 0 },
];

function Row({ item, last }: { item: MenuItem; last?: boolean }) {
  return (
    <div
      className={['item', item.count > 0 ? 'item--in-basket' : '', last ? 'item--last' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className="item__text">
        <div className="item__name">{item.name}</div>
        <div className="item__note">{item.note}</div>
      </div>
      <div className="item__right">
        <div className="item__price">{item.price}</div>
        <div className={item.count > 0 ? 'stepper stepper--count' : 'stepper'}>
          {item.count > 0 ? item.count : '+'}
        </div>
      </div>
    </div>
  );
}

/**
 * 8. Canteen — a menu, set like a menu. Day strip on top, prices in the same
 * weight as the item, in-basket rows filled bone. One black bar to commit.
 */
export function Canteen() {
  return (
    <div className="screen">
      <div className="cant__head">
        <h1 className="display cant__title">CANTEEN</h1>
        <div className="eyebrow eyebrow--ash">Otto · Year 1 · balance $32.10</div>
      </div>

      <div className="days">
        {DAYS.map((day) => (
          <div
            key={day}
            className={day === ACTIVE_DAY ? 'days__day days__day--active' : 'days__day'}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="eyebrow eyebrow--ash cant__section">Hot</div>
      <div>
        {HOT.map((item) => (
          <Row key={item.name} item={item} />
        ))}
      </div>

      <div className="eyebrow eyebrow--ash cant__section">Cold &amp; sweet</div>
      <div>
        {COLD.map((item, i) => (
          <Row key={item.name} item={item} last={i === COLD.length - 1} />
        ))}
      </div>

      <div className="cant__foot">
        <div className="order-bar">
          <span>Order · Tuesday</span>
          <span>$5.00</span>
        </div>
        <div className="cant__cutoff">Cut-off 8.30am</div>
      </div>
    </div>
  );
}
