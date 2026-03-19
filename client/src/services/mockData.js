export const mockMenu = [
  {
    _id: 'm1',
    name: 'Belvedere Smash Burger',
    price: 540,
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
    category: 'Burgers',
    description: 'Double beef patty, cheddar, caramelized onion and house sauce.',
  },
  {
    _id: 'm2',
    name: 'Truffle Alfredo Pasta',
    price: 620,
    image:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80',
    category: 'Pasta',
    description: 'Creamy parmesan Alfredo with truffle aroma and roasted mushrooms.',
  },
  {
    _id: 'm3',
    name: 'Citrus Grilled Chicken',
    price: 680,
    image:
      'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=80',
    category: 'Mains',
    description: 'Herb grilled chicken breast served with butter vegetables.',
  },
  {
    _id: 'm4',
    name: 'Mango Sparkler',
    price: 250,
    image:
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80',
    category: 'Drinks',
    description: 'Fresh mango, soda and mint served chilled.',
  },
  {
    _id: 'm5',
    name: 'Sea Salt Fries',
    price: 220,
    image:
      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80',
    category: 'Sides',
    description: 'Crispy fries tossed with sea salt and paprika.',
  },
  {
    _id: 'm6',
    name: 'Molten Chocolate Cake',
    price: 340,
    image:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80',
    category: 'Desserts',
    description: 'Warm chocolate center with vanilla cream.',
  },
]

export const mockOrders = [
  {
    _id: 'o1',
    tableNumber: 'T12',
    totalPrice: 1160,
    status: 'pending',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString(),
    items: [
      { name: 'Belvedere Smash Burger', quantity: 1, price: 540 },
      { name: 'Mango Sparkler', quantity: 1, price: 250 },
      { name: 'Sea Salt Fries', quantity: 1, price: 220 },
    ],
  },
  {
    _id: 'o2',
    tableNumber: 'T04',
    totalPrice: 620,
    status: 'preparing',
    paymentStatus: 'unpaid',
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    items: [{ name: 'Truffle Alfredo Pasta', quantity: 1, price: 620 }],
  },
]
