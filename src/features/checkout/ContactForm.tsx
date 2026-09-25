import type { Contact } from './checkout.types';
export function ContactForm({
  contact,
  setContact,
  next,
}: {
  contact: Contact;
  setContact: (value: Contact) => void;
  next: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        next();
      }}
    >
      <p>Where can we keep you up to date?</p>
      <label>
        Email address
        <input
          type="email"
          required
          autoComplete="email"
          value={contact.email}
          onChange={(e) => setContact({ ...contact, email: e.target.value })}
        />
      </label>
      <label>
        Phone number <span>(optional)</span>
        <input
          type="tel"
          autoComplete="tel"
          value={contact.phone}
          onChange={(e) => setContact({ ...contact, phone: e.target.value })}
        />
      </label>
      <button className="button" type="submit">
        Continue to Shipping
      </button>
    </form>
  );
}
