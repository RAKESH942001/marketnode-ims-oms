export interface StoreProduct {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  inStock: boolean;
}

export const fetchStoreProducts = async (): Promise<StoreProduct[]> => {
  const response = await fetch('/api/store/products');
  if (!response.ok) throw new Error('Failed to fetch store products');
  return response.json();
};

export const fetchStoreProduct = async (id: string): Promise<StoreProduct> => {
  const response = await fetch(`/api/store/products/${id}`);
  if (!response.ok) throw new Error('Failed to fetch product');
  return response.json();
};
