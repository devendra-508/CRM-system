// Temporary in-memory data store.
// Structured so each function can later be swapped for a real
// PostgreSQL query without changing the routes that call them.

export let customers = [
  { id: 1, name: "Ramesh Traders", phone: "9876543210", email: "ramesh@traders.com", address: "MG Road", city: "Delhi", customerType: "Wholesale", totalPurchase: 45200 },
  { id: 2, name: "City Pharma", phone: "9123456780", email: "contact@citypharma.com", address: "Park Street", city: "Mumbai", customerType: "Pharmacy", totalPurchase: 128900 },
];

export let products = [
  { id: 1, productName: "Paracetamol 500mg", productCode: "PCM500", batchNumber: "B2201", quantity: 8, currentStock: 8, purchaseRate: 2.5, mrp: 4, expiryDate: "2027-03-15" },
  { id: 2, productName: "Amoxicillin 250mg", productCode: "AMX250", batchNumber: "B2305", quantity: 145, currentStock: 145, purchaseRate: 5.2, mrp: 8, expiryDate: "2026-11-20" },
];

export let purchases = [
  { id: 1, customerId: 1, customerName: "Ramesh Traders", productId: 1, productName: "Paracetamol 500mg", quantity: 50, purchaseRate: 2.5, totalAmount: 125, invoiceNumber: "INV-1001", purchaseDate: "2026-08-28" },
];

export let nextId = { customer: 3, product: 3, purchase: 2 };