import { Modal } from './Primitives';

export function InfoDialog({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="info-content">
        <p>This storefront is an interactive design preview.</p>
        <p>
          {title === 'Offer Details'
            ? 'Prices and product discounts come from the connected store. Additional offer codes are not enabled yet.'
            : 'Account, customer service and marketing services are not connected in this preview. You can explore products, build a bag and try the demo checkout.'}
        </p>
        <button className="button" onClick={onClose}>
          Continue Exploring
        </button>
      </div>
    </Modal>
  );
}
