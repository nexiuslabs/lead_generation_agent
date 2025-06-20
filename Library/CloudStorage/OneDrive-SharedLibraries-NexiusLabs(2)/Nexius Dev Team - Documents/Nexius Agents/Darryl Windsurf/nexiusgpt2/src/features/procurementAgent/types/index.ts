// Procurement-specific types

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  unitPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  supplierId: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  date: number;
  total: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'shipped' | 'delivered';
  items: OrderItem[];
}

export interface ProcurementPromptRequest {
  type: 'supplier-search' | 'price-comparison' | 'purchase-order' | 'inventory-check';
  productCategories?: string[];
  supplierCriteria?: string[];
  budget?: number;
  deadline?: string;
  quantity?: number;
  additionalInstructions?: string;
}