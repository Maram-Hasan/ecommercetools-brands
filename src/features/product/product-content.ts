export function productSections(description: string) {
  return [
    {
      title: 'Product Details',
      content:
        description ||
        'Additional product specifications are not available yet.',
    },
    {
      title: 'Shipping & Returns',
      content:
        'Delivery estimates and return options will be available when checkout is connected. This preview does not place orders.',
    },
  ];
}
