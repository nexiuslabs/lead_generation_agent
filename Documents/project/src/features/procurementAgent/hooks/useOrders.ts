import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface OrderItem {
  id: string;
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  date: number;
  total: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'shipped' | 'delivered';
  items: OrderItem[];
}

interface UseOrdersOptions {
  onSave?: (order: PurchaseOrder) => void;
  onError?: (error: Error) => void;
}

const useOrders = (options?: UseOrdersOptions) => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [currentOrder, setCurrentOrder] = useState<PurchaseOrder | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Create a new order
  const createOrder = useCallback((initialData?: Partial<PurchaseOrder>) => {
    const now = Date.now();
    // Generate a fake order number with current timestamp and random suffix
    const orderNumber = `PO-${now.toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    const newOrder: PurchaseOrder = {
      id: uuidv4(),
      orderNumber,
      supplier: initialData?.supplier || '',
      date: now,
      total: initialData?.total || 0,
      status: 'draft',
      items: initialData?.items || []
    };
    
    setCurrentOrder(newOrder);
    return newOrder;
  }, []);

  // Add an item to the current order
  const addItem = useCallback((item: Omit<OrderItem, 'id' | 'total'>) => {
    if (!currentOrder) return null;
    
    const newItem: OrderItem = {
      id: uuidv4(),
      ...item,
      total: item.quantity * item.unitPrice
    };
    
    // Calculate new total
    const newTotal = currentOrder.items.reduce(
      (sum, item) => sum + item.total, 
      0
    ) + newItem.total;
    
    const updatedOrder = {
      ...currentOrder,
      items: [...currentOrder.items, newItem],
      total: newTotal
    };
    
    setCurrentOrder(updatedOrder);
    return updatedOrder;
  }, [currentOrder]);

  // Remove an item from the current order
  const removeItem = useCallback((itemId: string) => {
    if (!currentOrder) return null;
    
    const updatedItems = currentOrder.items.filter(item => item.id !== itemId);
    const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    
    const updatedOrder = {
      ...currentOrder,
      items: updatedItems,
      total: newTotal
    };
    
    setCurrentOrder(updatedOrder);
    return updatedOrder;
  }, [currentOrder]);

  // Update an item in the current order
  const updateItem = useCallback((itemId: string, updates: Partial<OrderItem>) => {
    if (!currentOrder) return null;
    
    const updatedItems = currentOrder.items.map(item => {
      if (item.id !== itemId) return item;
      
      const quantity = updates.quantity ?? item.quantity;
      const unitPrice = updates.unitPrice ?? item.unitPrice;
      
      return {
        ...item,
        ...updates,
        quantity,
        unitPrice,
        total: quantity * unitPrice
      };
    });
    
    const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    
    const updatedOrder = {
      ...currentOrder,
      items: updatedItems,
      total: newTotal
    };
    
    setCurrentOrder(updatedOrder);
    return updatedOrder;
  }, [currentOrder]);

  // Save the current order
  const saveOrder = useCallback(async (status?: PurchaseOrder['status']) => {
    if (!currentOrder) return null;
    
    try {
      setIsSaving(true);
      
      const updatedOrder = {
        ...currentOrder,
        status: status || currentOrder.status
      };
      
      // Update the orders list
      setOrders(prevOrders => {
        const index = prevOrders.findIndex(o => o.id === updatedOrder.id);
        if (index >= 0) {
          // Update existing order
          const newOrders = [...prevOrders];
          newOrders[index] = updatedOrder;
          return newOrders;
        } else {
          // Add new order
          return [...prevOrders, updatedOrder];
        }
      });
      
      // Set the current order to the updated order
      setCurrentOrder(updatedOrder);
      
      // Call the onSave callback if provided
      if (options?.onSave) {
        options.onSave(updatedOrder);
      }
      
      return updatedOrder;
    } catch (error) {
      console.error('Error saving order:', error);
      
      // Call the onError callback if provided
      if (options?.onError && error instanceof Error) {
        options.onError(error);
      }
      
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentOrder, options]);

  // Update order status
  const updateStatus = useCallback((orderId: string, status: PurchaseOrder['status']) => {
    setOrders(prevOrders => {
      return prevOrders.map(order => {
        if (order.id !== orderId) return order;
        return { ...order, status };
      });
    });
    
    // Update current order if it's the one being updated
    if (currentOrder?.id === orderId) {
      setCurrentOrder(prev => prev ? { ...prev, status } : null);
    }
  }, [currentOrder]);

  return {
    orders,
    currentOrder,
    isSaving,
    createOrder,
    addItem,
    removeItem,
    updateItem,
    saveOrder,
    updateStatus
  };
};

export default useOrders;