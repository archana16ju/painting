/**
 * Core Type Definitions for Paint Shop ERP & Billing Software
 */

export type PaintBrand =
  | 'Surfa Coats'
  | 'Arun & Tia'
  | 'Asian Paints'
  | 'Berger'
  | 'Dulux'
  | 'Nerolac'
  | 'Nippon'
  | 'Birla Opus'
  | 'Indigo'
  | 'MRF'
  | 'Shalimar'
  | 'JSW Paints'
  | 'Other';

export type ProductCategory =
  | 'Interior Emulsion'
  | 'Exterior Emulsion'
  | 'Wall Primer'
  | 'Enamel & Gloss'
  | 'Distemper'
  | 'Wall Putty'
  | 'Waterproofing'
  | 'Wood Finish'
  | 'Thinners & Solvents'
  | 'Hardware & Tools'
  | 'Colorant Tint'
  | (string & {});

export type PackSizeUnit =
  | '100ml'
  | '200ml'
  | '500ml'
  | '1L'
  | '4L'
  | '10L'
  | '20L'
  | '1kg'
  | '2kg'
  | '5kg'
  | '10kg'
  | '20kg'
  | '40kg'
  | '1 Pc'
  | (string & {});

export type BaseType =
  | 'White Base'
  | 'Base 1'
  | 'Base 2'
  | 'Base 3'
  | 'Yellow Base'
  | 'Deep Base'
  | 'Accent Base'
  | 'Direct';

export type CustomerType = 'RETAIL' | 'CONTRACTOR' | 'BUILDER' | 'WHOLESALE';

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'SPLIT' | 'CREDIT';

export interface PaintShade {
  id: string;
  brand: string;
  shadeCode: string;
  shadeName: string;
  hexColor: string;
  baseType: BaseType;
  description?: string;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  category: ProductCategory;
  hsnCode: string;
  defaultTaxRate: number; // e.g. 18 for 18% GST
  description?: string;
  isActive: boolean;
  packSizes?: ProductPackSize[];
}

export interface ProductPackSize {
  id: string;
  productId: string;
  packSize: PackSizeUnit;
  barcode: string;
  mrp: number;
  retailPrice: number;
  contractorPrice: number;
  wholesalePrice: number;
  costPrice: number;
  stockQty: number;
  minStockAlert: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  gstin?: string;
  customerType: CustomerType;
  creditLimit: number;
  currentBalance: number;
  createdAt: string;
}

export interface Contractor {
  id: string;
  name: string;
  phone: string;
  address?: string;
  commissionRate: number; // e.g. 5% or flat points
  creditLimit: number;
  currentBalance: number;
  status: 'ACTIVE' | 'INACTIVE';
  totalCommissionEarned: number;
  totalCommissionPaid: number;
}

export interface ContractorLedgerEntry {
  id: string;
  contractorId: string;
  billId?: string;
  type: 'DEBIT' | 'CREDIT'; // DEBIT = Purchase on credit, CREDIT = Payment received
  amount: number;
  balanceAfter: number;
  paymentMode?: string;
  notes?: string;
  createdAt: string;
}

export interface BillItem {
  id: string;
  billId?: string;
  productId: string;
  packSizeId: string;
  brand: string;
  productName: string;
  packSize: PackSizeUnit;
  shadeCode?: string;
  shadeName?: string;
  quantity: number;
  rate: number;
  discountPercent: number;
  taxPercent: number;
  taxAmount: number;
  amount: number; // Subtotal for item
  isTinted: boolean;
  dispenserFormula?: string;
}

export interface Bill {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerGstin?: string;
  contractorId?: string;
  contractorName?: string;
  siteName?: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  paymentMode: PaymentMethod;
  paymentDetails?: string; // e.g. "Cash: 5000, UPI: 3500"
  status: 'PAID' | 'PARTIAL' | 'CREDIT' | 'CANCELLED';
  createdAt: string;
  items: BillItem[];
}

export interface PaintEstimate {
  id: string;
  estimateNumber: string;
  customerName: string;
  customerPhone?: string;
  projectName?: string;
  totalSqFt: number;
  surfaceType: 'FRESH_PLASTER' | 'REPAINTING' | 'EXTERIOR_TEXTURE';
  qualityTier: 'ECONOMY' | 'PREMIUM' | 'LUXURY';
  puttyKg: number;
  primerLiters: number;
  paintLiters: number;
  estimatedTotal: number;
  createdAt: string;
}

export interface ShopSettings {
  shopName: string;
  tagline?: string;
  address: string;
  phone: string;
  email?: string;
  gstin: string;
  invoicePrefix: string;
  thermalPaperSize: '58mm' | '80mm';
  enableWhatsApp: boolean;
  whatsAppApiKey?: string;
  termsAndConditions?: string;
  bankDetails?: string;
  upiId?: string;
}
