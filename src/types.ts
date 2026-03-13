export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'burgers' | 'portions' | 'drinks';
  description?: string;
  hasDoubleOption?: boolean;
  doublePrice?: number;
  options?: string[];
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  additions: string[];
  removals: string[];
  isDouble?: boolean;
  selectedOption?: string;
}

export interface Order {
  id: number;
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  createdAt: string;
  total: number;
}
