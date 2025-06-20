import React from 'react';
import { FileText, CheckSquare, Truck, AlertTriangle, BarChart, ShoppingBag } from 'lucide-react';

const ProcurementToolbar: React.FC = () => {
  return (
    <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-1 bg-gray-50 dark:bg-dark-secondary">
      <button className="p-1.5 text-sm font-medium rounded-md flex items-center hover:bg-gray-200 dark:hover:bg-dark-tertiary">
        <FileText size={16} className="mr-1" />
        <span>New Order</span>
      </button>
      
      <button className="p-1.5 text-sm font-medium rounded-md flex items-center hover:bg-gray-200 dark:hover:bg-dark-tertiary">
        <ShoppingBag size={16} className="mr-1" />
        <span>Inventory</span>
      </button>
      
      <button className="p-1.5 text-sm font-medium rounded-md flex items-center hover:bg-gray-200 dark:hover:bg-dark-tertiary">
        <CheckSquare size={16} className="mr-1" />
        <span>Approvals</span>
      </button>
      
      <button className="p-1.5 text-sm font-medium rounded-md flex items-center hover:bg-gray-200 dark:hover:bg-dark-tertiary">
        <Truck size={16} className="mr-1" />
        <span>Shipments</span>
      </button>
      
      <div className="flex-1"></div>
      
      <button className="p-1.5 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-dark-tertiary">
        <AlertTriangle size={16} />
      </button>
      
      <button className="p-1.5 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-dark-tertiary">
        <BarChart size={16} />
      </button>
    </div>
  );
};

export default ProcurementToolbar;