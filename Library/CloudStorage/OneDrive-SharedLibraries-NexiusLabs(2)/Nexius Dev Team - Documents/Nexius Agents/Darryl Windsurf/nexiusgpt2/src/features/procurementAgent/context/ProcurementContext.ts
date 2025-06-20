import { createContext } from 'react';

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  date: number;
  total: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'shipped' | 'delivered';
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
}

interface Product {
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

interface ProcurementContextType {
  orders: PurchaseOrder[];
  suppliers: Supplier[];
  products: Product[];
}

// Default context values
const defaultContext: ProcurementContextType = {
  orders: [],
  suppliers: [],
  products: []
};

const ProcurementContext = createContext<ProcurementContextType>(defaultContext);

export default ProcurementContext;