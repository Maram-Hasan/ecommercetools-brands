import { type ReactNode } from 'react';
import { Icon } from '../../components/Primitives';

export function CheckoutStep({
  number,
  title,
  active,
  complete,
  summary,
  onEdit,
  children,
}: {
  number: number;
  title: string;
  active: boolean;
  complete: boolean;
  summary?: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className={`checkout-step ${active ? 'active' : ''}`}>
      <div className="checkout-step-heading">
        <span className={`step-number ${complete ? 'complete' : ''}`}>
          {complete ? <Icon name="check" size={16} /> : number}
        </span>
        <h2>{title}</h2>
        {complete && (
          <button className="text-button" onClick={onEdit}>
            Edit
          </button>
        )}
      </div>
      {complete && !active && <p className="step-summary">{summary}</p>}
      {active && <div className="checkout-step-body">{children}</div>}
    </section>
  );
}
