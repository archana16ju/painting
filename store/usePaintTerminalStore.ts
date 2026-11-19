import { create } from 'zustand';
import { BillItem, PaintBrand, PaintShade, PackSizeUnit, Product, ProductPackSize } from '@/types/paint';

export type PriceTier = 'RETAIL' | 'CONTRACTOR' | 'WHOLESALE';

interface CartItem extends BillItem {
  tempId: string;
  retailPrice?: number;
  contractorPrice?: number;
  wholesalePrice?: number;
}

interface PaintTerminalState {
  // Cart
  cart: CartItem[];
  selectedBrand: PaintBrand | 'ALL';
  priceTier: PriceTier;
  selectedContractor: { id: string; name: string; phone: string; balance: number; limit: number } | null;
  siteName: string;
  customerName: string;
  customerPhone: string;
  customerGstin: string;

  // Modals
  isShadeModalOpen: boolean;
  activeShadeItemTempId: string | null;
  isContractorModalOpen: boolean;
  isEstimatorModalOpen: boolean;
  isPaymentModalOpen: boolean;
  isInvoiceModalOpen: boolean;
  lastBillId: string | null;
  isEditMode: boolean;

  // Actions
  toggleEditMode: () => void;
  setEditMode: (val: boolean) => void;
  setSelectedBrand: (brand: PaintBrand | 'ALL') => void;
  setPriceTier: (tier: PriceTier) => void;
  setSelectedContractor: (contractor: { id: string; name: string; phone: string; balance: number; limit: number } | null) => void;
  setSiteName: (site: string) => void;
  setCustomerInfo: (info: { name: string; phone?: string; gstin?: string }) => void;
  
  addToCart: (product: Product, packSize: ProductPackSize, shade?: PaintShade) => void;
  updateQuantity: (tempId: string, delta: number) => void;
  updateDiscount: (tempId: string, discountPercent: number) => void;
  attachShadeToItem: (tempId: string, shade: PaintShade, formula?: string) => void;
  removeFromCart: (tempId: string) => void;
  clearCart: () => void;

  openShadeModal: (tempId?: string) => void;
  closeShadeModal: () => void;
  openContractorModal: () => void;
  closeContractorModal: () => void;
  openEstimatorModal: () => void;
  closeEstimatorModal: () => void;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  openInvoiceModal: (billId: string) => void;
  closeInvoiceModal: () => void;

  // Calculations
  getSubtotal: () => number;
  getTotalTax: () => number;
  getGrandTotal: () => number;
}

export const usePaintTerminalStore = create<PaintTerminalState>((set, get) => ({
  cart: [],
  selectedBrand: 'ALL',
  priceTier: 'RETAIL',
  selectedContractor: null,
  siteName: '',
  customerName: '',
  customerPhone: '',
  customerGstin: '',

  isShadeModalOpen: false,
  activeShadeItemTempId: null,
  isContractorModalOpen: false,
  isEstimatorModalOpen: false,
  isPaymentModalOpen: false,
  isInvoiceModalOpen: false,
  lastBillId: null,
  isEditMode: false,

  toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
  setEditMode: (val) => set({ isEditMode: val }),

  setSelectedBrand: (brand) => set({ selectedBrand: brand }),
  setPriceTier: (tier) => {
    set((state) => ({
      priceTier: tier,
      cart: state.cart.map((item) => {
        let newRate = item.rate;
        if (tier === 'RETAIL' && item.retailPrice != null) newRate = item.retailPrice;
        if (tier === 'CONTRACTOR' && item.contractorPrice != null) newRate = item.contractorPrice;
        if (tier === 'WHOLESALE' && item.wholesalePrice != null) newRate = item.wholesalePrice;
        const taxable = item.quantity * newRate * (1 - item.discountPercent / 100);
        return {
          ...item,
          rate: newRate,
          amount: taxable,
          taxAmount: taxable * (item.taxPercent / 100),
        };
      }),
    }));
  },
  setSelectedContractor: (contractor) => {
    const newTier: PriceTier = contractor ? 'CONTRACTOR' : 'RETAIL';
    set((state) => ({
      selectedContractor: contractor,
      priceTier: newTier,
      customerName: contractor ? contractor.name : state.customerName,
      customerPhone: contractor ? contractor.phone : state.customerPhone,
      cart: state.cart.map((item) => {
        let newRate = item.rate;
        if (newTier === 'CONTRACTOR' && item.contractorPrice != null) {
          newRate = item.contractorPrice;
        } else if (item.retailPrice != null) {
          newRate = item.retailPrice;
        }
        const taxable = item.quantity * newRate * (1 - item.discountPercent / 100);
        return {
          ...item,
          rate: newRate,
          amount: taxable,
          taxAmount: taxable * (item.taxPercent / 100),
        };
      }),
    }));
  },
  setSiteName: (siteName) => set({ siteName }),
  setCustomerInfo: ({ name, phone, gstin }) =>
    set({
      customerName: name,
      customerPhone: phone || '',
      customerGstin: gstin || '',
    }),

  addToCart: (product, packSize, shade) => {
    const { priceTier, cart } = get();
    let rate = packSize.retailPrice;
    if (priceTier === 'CONTRACTOR') rate = packSize.contractorPrice;
    if (priceTier === 'WHOLESALE') rate = packSize.wholesalePrice;

    const shadeCode = shade?.shadeCode || '';

    // Check if the exact product, pack size and shade already exist in cart
    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === product.id &&
        item.packSizeId === packSize.id &&
        (item.shadeCode || '') === shadeCode
    );

    if (existingIndex > -1) {
      // Product already in cart: Increment count only
      set((state) => ({
        cart: state.cart.map((item, idx) => {
          if (idx !== existingIndex) return item;
          const newQty = item.quantity + 1;
          const taxable = newQty * item.rate * (1 - item.discountPercent / 100);
          return {
            ...item,
            quantity: newQty,
            amount: taxable,
            taxAmount: taxable * (item.taxPercent / 100),
          };
        }),
      }));
    } else {
      // First time adding this product & pack size: create new entry
      const tempId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const taxRate = product.defaultTaxRate || 18.0;

      const newItem: CartItem = {
        tempId,
        id: tempId,
        productId: product.id,
        packSizeId: packSize.id,
        brand: product.brand,
        productName: product.name,
        packSize: packSize.packSize,
        shadeCode: shade?.shadeCode || '',
        shadeName: shade?.shadeName || '',
        quantity: 1,
        rate,
        retailPrice: packSize.retailPrice,
        contractorPrice: packSize.contractorPrice,
        wholesalePrice: packSize.wholesalePrice || packSize.contractorPrice,
        discountPercent: 0,
        taxPercent: taxRate,
        taxAmount: rate * (taxRate / 100),
        amount: rate,
        isTinted: Boolean(shade),
      };

      set((state) => ({ cart: [newItem, ...state.cart] }));
    }
  },

  updateQuantity: (tempId, delta) => {
    set((state) => ({
      cart: state.cart
        .map((item) => {
          if (item.tempId !== tempId) return item;
          const newQty = Math.max(1, item.quantity + delta);
          const taxable = newQty * item.rate * (1 - item.discountPercent / 100);
          return {
            ...item,
            quantity: newQty,
            amount: taxable,
            taxAmount: taxable * (item.taxPercent / 100),
          };
        })
        .filter((item) => item.quantity > 0),
    }));
  },

  updateDiscount: (tempId, discountPercent) => {
    set((state) => ({
      cart: state.cart.map((item) => {
        if (item.tempId !== tempId) return item;
        const taxable = item.quantity * item.rate * (1 - discountPercent / 100);
        return {
          ...item,
          discountPercent,
          amount: taxable,
          taxAmount: taxable * (item.taxPercent / 100),
        };
      }),
    }));
  },

  attachShadeToItem: (tempId, shade, formula) => {
    set((state) => ({
      cart: state.cart.map((item) => {
        if (item.tempId !== tempId) return item;
        return {
          ...item,
          shadeCode: shade.shadeCode,
          shadeName: shade.shadeName,
          isTinted: true,
          dispenserFormula: formula,
        };
      }),
      isShadeModalOpen: false,
      activeShadeItemTempId: null,
    }));
  },

  removeFromCart: (tempId) => {
    set((state) => ({ cart: state.cart.filter((item) => item.tempId !== tempId) }));
  },

  clearCart: () => {
    set({
      cart: [],
      selectedContractor: null,
      siteName: '',
      customerName: '',
      customerPhone: '',
      customerGstin: '',
      priceTier: 'RETAIL',
    });
  },

  openShadeModal: (tempId) => set({ isShadeModalOpen: true, activeShadeItemTempId: tempId || null }),
  closeShadeModal: () => set({ isShadeModalOpen: false, activeShadeItemTempId: null }),
  openContractorModal: () => set({ isContractorModalOpen: true }),
  closeContractorModal: () => set({ isContractorModalOpen: false }),
  openEstimatorModal: () => set({ isEstimatorModalOpen: true }),
  closeEstimatorModal: () => set({ isEstimatorModalOpen: false }),
  openPaymentModal: () => set({ isPaymentModalOpen: true }),
  closePaymentModal: () => set({ isPaymentModalOpen: false }),
  openInvoiceModal: (billId) => set({ isInvoiceModalOpen: true, lastBillId: billId }),
  closeInvoiceModal: () => set({ isInvoiceModalOpen: false }),

  getSubtotal: () => {
    const { cart } = get();
    return cart.reduce((sum, item) => sum + item.amount, 0);
  },

  getTotalTax: () => {
    const { cart } = get();
    return cart.reduce((sum, item) => sum + item.taxAmount, 0);
  },

  getGrandTotal: () => {
    const sub = get().getSubtotal();
    const tax = get().getTotalTax();
    return Math.round(sub + tax);
  },
}));
