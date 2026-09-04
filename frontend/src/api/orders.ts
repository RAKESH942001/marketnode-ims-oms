export interface Order {
  id: number;
  userId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export const placeOrder = async (userId: number, productId: number, quantity: number): Promise<Order> => {
  const response = await fetch(`/api/orders?userId=${userId}&productId=${productId}&quantity=${quantity}`, {
    method: 'POST'
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to place order');
  }
  return response.json();
};

export const fetchUserOrders = async (userId: number): Promise<Order[]> => {
  const response = await fetch(`/api/orders?userId=${userId}`);
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
};

export const cancelOrder = async (orderId: number): Promise<Order> => {
  const response = await fetch(`/api/orders/${orderId}/cancel`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to cancel order');
  return response.json();
};

export const fetchOrderById = async (orderId: number): Promise<Order> => {
  const response = await fetch(`/api/orders/${orderId}`);
  if (!response.ok) throw new Error('Failed to fetch order');
  return response.json();
};
