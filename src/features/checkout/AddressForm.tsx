import type { Address } from './checkout.types';
export function AddressForm({
  address,
  setAddress,
  next,
}: {
  address: Address;
  setAddress: (value: Address) => void;
  next: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        next();
      }}
    >
      <div className="field-pair">
        <label>
          First name
          <input
            required
            autoComplete="given-name"
            value={address.first}
            onChange={(e) => setAddress({ ...address, first: e.target.value })}
          />
        </label>
        <label>
          Last name
          <input
            required
            autoComplete="family-name"
            value={address.last}
            onChange={(e) => setAddress({ ...address, last: e.target.value })}
          />
        </label>
      </div>
      <label>
        Street address
        <input
          required
          autoComplete="address-line1"
          value={address.street}
          onChange={(e) => setAddress({ ...address, street: e.target.value })}
        />
      </label>
      <label>
        Apartment, suite, etc. <span>(optional)</span>
        <input
          autoComplete="address-line2"
          value={address.apartment}
          onChange={(e) =>
            setAddress({ ...address, apartment: e.target.value })
          }
        />
      </label>
      <div className="field-pair">
        <label>
          City
          <input
            required
            autoComplete="address-level2"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
          />
        </label>
        <label>
          State / Region
          <input
            required
            autoComplete="address-level1"
            value={address.region}
            onChange={(e) => setAddress({ ...address, region: e.target.value })}
          />
        </label>
      </div>
      <div className="field-pair">
        <label>
          ZIP / Postal code
          <input
            required
            autoComplete="postal-code"
            value={address.postal}
            onChange={(e) => setAddress({ ...address, postal: e.target.value })}
          />
        </label>
        <label>
          Country
          <select
            value={address.country}
            onChange={(e) =>
              setAddress({ ...address, country: e.target.value })
            }
          >
            <option>United States</option>
            <option>Canada</option>
          </select>
        </label>
      </div>
      <button className="button" type="submit">
        Continue to Delivery
      </button>
    </form>
  );
}
