import { Product, Role, User, Customer, Transaction, DistributionOrder, PurchaseOrder, Expense, Payable, Receivable, Supplier } from './types';

// Branches
// b1: Parami(1) Dawei
// b2: Parami(2) Yangon

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Kaung Kaung',
    email: 'admin@parami.com',
    role: Role.ADMIN,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop'
  },
  {
    id: 'u2',
    name: 'Kyaw Kyaw',
    email: 'pos@parami.com',
    role: Role.CASHIER,
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
    branchId: 'b1'
  }
];

export const mockCustomers: Customer[] = [
  { id: 'c1', name: 'U Ba Maung', phone: '095123456', points: 1250, tier: 'Gold', branchId: 'b1' },
  { id: 'c2', name: 'Daw Hla', phone: '097987654', points: 450, tier: 'Silver', branchId: 'b1' },
  { id: 'c3', name: 'Ko Aung', phone: '092500112', points: 2100, tier: 'Platinum', branchId: 'b2' },
  { id: 'c4', name: 'City Clinic', phone: '099999999', points: 5000, tier: 'Platinum', branchId: 'b1' },
  { id: 'c5', name: 'Royal Hospital', phone: '098888888', points: 12000, tier: 'Platinum', branchId: 'b2' },
];

// Helper to get date N days from now
const getDateInDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const mockProducts: Product[] = [
  // Branch 1 Products
  {
    id: 'p1',
    sku: 'MED-001',
    gtin: '03453120000011',
    nameEn: 'Paracetamol 500mg',
    nameMm: 'ပါရာစီတမော ၅၀၀ မီလီဂရမ်',
    genericName: 'Acetaminophen',
    category: 'Analgesics',
    price: 1500,
    image: '',
    stockLevel: 450,
    minStockLevel: 100,
    requiresPrescription: false,
    branchId: 'b1',
    batches: [
      { id: 'b1', batchNumber: 'BAT-001', expiryDate: '2024-12-31', quantity: 200, costPrice: 800 },
      { id: 'b2', batchNumber: 'BAT-002', expiryDate: '2025-06-30', quantity: 250, costPrice: 850 },
      { id: 'b1-gs1', batchNumber: 'ABC123', expiryDate: '2025-12-31', quantity: 100, costPrice: 800 } 
    ]
  },
  {
    id: 'p2',
    sku: 'MED-002',
    gtin: '03453120000028',
    nameEn: 'Amoxicillin 250mg',
    nameMm: 'အမောက်စီဆလင် ၂၅၀ မီလီဂရမ်',
    category: 'Antibiotics',
    genericName: 'Amoxicillin',
    price: 3500,
    image: '',
    stockLevel: 80,
    minStockLevel: 100,
    requiresPrescription: true,
    branchId: 'b1',
    batches: [
      { id: 'b3', batchNumber: 'BAT-003', expiryDate: getDateInDays(15), quantity: 30, costPrice: 2000 }, 
      { id: 'b3-2', batchNumber: 'BAT-004', expiryDate: getDateInDays(300), quantity: 50, costPrice: 2000 }
    ]
  },
  {
    id: 'p3',
    sku: 'VIT-001',
    nameEn: 'Vitamin C 1000mg',
    nameMm: 'ဗီတာမင် စီ ၁၀၀၀ မီလီဂရမ်',
    category: 'Supplements',
    genericName: 'Ascorbic Acid',
    price: 12000,
    image: '',
    stockLevel: 120,
    minStockLevel: 50,
    requiresPrescription: false,
    branchId: 'b1',
    batches: [
      { id: 'b4', batchNumber: 'BAT-005', expiryDate: '2025-12-31', quantity: 120, costPrice: 8000 }
    ]
  },
  
  // Branch 2 Products (Different set or stock)
  {
    id: 'p4',
    sku: 'MED-004',
    nameEn: 'Omeprazole 20mg',
    nameMm: 'အိုမီပရာဇော ၂၀ မီလီဂရမ်',
    category: 'Gastrointestinal',
    genericName: 'Omeprazole',
    price: 4500,
    image: '',
    stockLevel: 300,
    minStockLevel: 100,
    requiresPrescription: false,
    branchId: 'b2',
    batches: [
      { id: 'b5', batchNumber: 'BAT-006', expiryDate: getDateInDays(45), quantity: 100, costPrice: 3000 }, 
      { id: 'b6', batchNumber: 'BAT-007', expiryDate: getDateInDays(365), quantity: 200, costPrice: 3000 }
    ]
  },
  {
    id: 'p5',
    sku: 'MED-005',
    nameEn: 'Cetirizine 10mg',
    nameMm: 'စီထရီဇင်း ၁၀ မီလီဂရမ်',
    category: 'Antihistamine',
    genericName: 'Cetirizine Hydrochloride',
    price: 2000,
    image: '',
    stockLevel: 15,
    minStockLevel: 50,
    requiresPrescription: false,
    branchId: 'b2',
    batches: [
       { id: 'b7', batchNumber: 'BAT-008', expiryDate: getDateInDays(80), quantity: 15, costPrice: 1200 } 
    ]
  },
   {
    id: 'p6',
    sku: 'MED-006',
    nameEn: 'Metformin 500mg',
    nameMm: 'မက်ဖော်မင် ၅၀၀ မီလီဂရမ်',
    category: 'Diabetic',
    genericName: 'Metformin',
    price: 2500,
    image: '',
    stockLevel: 1500,
    minStockLevel: 200,
    requiresPrescription: true,
    branchId: 'b2',
    batches: [
      { id: 'b8', batchNumber: 'BAT-009', expiryDate: getDateInDays(20), quantity: 500, costPrice: 1500 }, 
      { id: 'b9', batchNumber: 'BAT-010', expiryDate: getDateInDays(400), quantity: 1000, costPrice: 1500 }
    ]
  }
];

export const mockDistributionOrders: DistributionOrder[] = [
  { 
    id: 'ORD-501', 
    customer: 'City Clinic', 
    address: '123 Pyay Road, Kamaryut', 
    status: 'PENDING', 
    total: 450000, 
    date: '2024-05-25',
    deliveryTime: '10:30',
    paymentType: 'CASH',
    itemsList: [{ id: '1', name: 'Paracetamol 500mg', quantity: 10, price: 15000 }],
    branchId: 'b1'
  },
  { 
    id: 'ORD-502', 
    customer: 'Royal Hospital', 
    address: '45 Strand Road, Lanmadaw', 
    status: 'PACKING', 
    total: 1250000, 
    date: '2024-05-25',
    deliveryTime: '14:00',
    paymentType: 'CREDIT',
    itemsList: [{ id: '2', name: 'Amoxicillin 250mg', quantity: 45, price: 3500 }],
    branchId: 'b2' 
  },
  { 
    id: 'ORD-503', 
    customer: 'Shwe Gon Pharamcy', 
    address: '88 Shwe Gon Daing, Bahan', 
    status: 'DELIVERING', 
    total: 240000, 
    date: '2024-05-24',
    deliveryTime: '09:00',
    paymentType: 'CASH',
    itemsList: [{ id: '3', name: 'Vitamin C', quantity: 20, price: 12000 }],
    branchId: 'b1' 
  },
];

export const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'AA Medical', contact: '0911223344', email: 'sales@aamedical.com', credit: 5000000, outstanding: 1200000, branchId: 'b1' },
  { id: 's2', name: 'Zifam', contact: '0955667788', email: 'order@zifam.com', credit: 3000000, outstanding: 0, branchId: 'b1' },
  { id: 's3', name: 'Mega Lifesciences', contact: '0999887766', email: 'info@mega.com', credit: 10000000, outstanding: 4500000, branchId: 'b2' },
];

export const mockTransactions: Transaction[] = [
  // Branch 1 Transactions
  { id: 't1', type: 'INCOME', category: 'Antibiotics', amount: 45000, date: getDateInDays(0), description: 'POS Sale #101', branchId: 'b1' },
  { id: 't2', type: 'INCOME', category: 'Vitamins', amount: 28000, date: getDateInDays(0), description: 'POS Sale #102', branchId: 'b1' },
  { id: 't3', type: 'EXPENSE', category: 'Utility', amount: 15000, date: getDateInDays(0), description: 'Water Bill', branchId: 'b1' },
  { id: 't4', type: 'INCOME', category: 'Analgesics', amount: 125000, date: getDateInDays(-1), description: 'POS Daily Sales', branchId: 'b1' },

  // Branch 2 Transactions
  { id: 't10', type: 'INCOME', category: 'Diabetic', amount: 180000, date: getDateInDays(0), description: 'POS Sale #B2-101', branchId: 'b2' },
  { id: 't11', type: 'INCOME', category: 'Antibiotics', amount: 95000, date: getDateInDays(-1), description: 'POS Sale #B2-100', branchId: 'b2' },
  { id: 't16', type: 'EXPENSE', category: 'Rent', amount: 1500000, date: getDateInDays(-25), description: 'Shop Rental Fee', branchId: 'b2' },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-2405-001',
    supplierId: 's1',
    supplierName: 'AA Medical',
    date: '2024-05-20',
    status: 'RECEIVED',
    paymentType: 'CREDIT',
    items: [
      { id: 'pi1', name: 'Paracetamol 500mg', quantity: 100, unitCost: 800 },
      { id: 'pi2', name: 'Amoxicillin 250mg', quantity: 50, unitCost: 2000 }
    ],
    totalAmount: 180000,
    branchId: 'b1'
  },
  {
    id: 'PO-2405-002',
    supplierId: 's2',
    supplierName: 'Zifam',
    date: '2024-05-22',
    status: 'ORDERED',
    paymentType: 'CASH',
    items: [
      { id: 'pi3', name: 'Vitamin C 1000mg', quantity: 200, unitCost: 5000 }
    ],
    totalAmount: 1000000,
    branchId: 'b1'
  },
  {
    id: 'PO-2405-003',
    supplierId: 's3',
    supplierName: 'Mega Lifesciences',
    date: '2024-05-23',
    status: 'PENDING',
    paymentType: 'CREDIT',
    items: [
      { id: 'pi4', name: 'Metformin', quantity: 1000, unitCost: 1500 }
    ],
    totalAmount: 1500000,
    branchId: 'b2'
  }
];

export const mockExpenses: Expense[] = [
  { id: 'ex1', category: 'Rent', amount: 1500000, date: '2024-05-01', description: 'Monthly Shop Rental', status: 'PAID', branchId: 'b1' },
  { id: 'ex2', category: 'Salary', amount: 850000, date: '2024-05-05', description: 'Staff Salaries', status: 'PAID', branchId: 'b1' },
  { id: 'ex3', category: 'Utilities', amount: 65000, date: '2024-05-15', description: 'Electric Bill', status: 'PENDING', branchId: 'b2' },
];

export const mockPayables: Payable[] = [
  { id: 'p1', supplierName: 'AA Medical', invoiceNo: 'INV-2024-001', amount: 1200000, dueDate: '2024-05-20', status: 'OVERDUE', branchId: 'b1' },
  { id: 'p2', supplierName: 'Zifam', invoiceNo: 'INV-2024-089', amount: 450000, dueDate: '2024-05-28', status: 'DUE_SOON', branchId: 'b1' },
  { id: 'p3', supplierName: 'Mega Lifesciences', invoiceNo: 'INV-2024-112', amount: 890000, dueDate: '2024-06-05', status: 'NORMAL', branchId: 'b2' },
];

export const mockReceivables: Receivable[] = [
  { id: 'r1', customerName: 'City Clinic', orderId: 'ORD-501', amount: 450000, dueDate: '2024-05-25', status: 'DUE_SOON' as any, branchId: 'b1' },
  { id: 'r2', customerName: 'Royal Hospital', orderId: 'ORD-502', amount: 1250000, dueDate: '2024-05-22', status: 'OVERDUE', branchId: 'b2' },
];