import { useEffect, useState } from 'react';
import { Card, Button, Input, Chip } from '@heroui/react';
import { fetchStoreProduct, StoreProduct } from '../../api/store';
import { placeOrder } from '../../api/orders';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function StoreProductDetailPage({ id, userId, onBack, onOrderPlaced }: any) {
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreProduct(id)
      .then((data: StoreProduct) => {
        setProduct(data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePlaceOrder = () => {
    if (!product || quantity < 1) return;
    setIsOrdering(true);
    setOrderError(null);
    placeOrder(userId, product.id, quantity)
      .then((order) => {
        onOrderPlaced(order.id);
      })
      .catch((err) => {
        setOrderError(err.message || 'Failed to place order');
        setIsOrdering(false);
      });
  };

  if (loading) return <LoadingSpinner />;
  if (error || !product) return <div className="text-danger">{error || 'Product not found'}</div>;

  return (
    <div className="max-w-5xl">
      <Button variant="flat" onClick={onBack} className="mb-8 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm font-medium rounded-full px-6 transition-all">
        &larr; Back to Storefront
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card className="w-full h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 shadow-inner border border-blue-100 rounded-3xl overflow-hidden">
            <span className="text-default-400 text-7xl drop-shadow-sm">🛍️</span>
          </Card>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full tracking-wider uppercase">{product.category || 'General'}</span>
          </div>

          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            <Chip className={product.inStock ? 'bg-success text-success-foreground' : 'bg-danger text-danger-foreground'} variant="soft">
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </Chip>
          </div>

          <p className="text-default-600 mb-8 leading-relaxed">
            {product.description || 'No detailed description available for this product.'}
          </p>

          <hr className="my-8 border-default-100" />

          {product.inStock ? (
            <div className="bg-gradient-to-r from-blue-50/50 to-white p-7 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
              <h3 className="font-semibold text-blue-900 mb-5 text-lg relative z-10">Place Your Order</h3>
              <div className="flex flex-col gap-5 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-32 flex flex-col gap-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <Input
                      type="number"
                      min={1}
                      value={String(quantity)}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                  <div className="flex flex-col justify-end h-[60px]">
                    <p className="text-sm text-default-500">Total</p>
                    <p className="text-xl font-bold">${(product.price * quantity).toFixed(2)}</p>
                  </div>
                </div>

                {orderError && (
                  <div className="text-danger text-sm bg-danger-50 p-3 rounded-lg border border-danger-200">
                    {orderError}
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full mt-4 font-semibold shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 transition-opacity"
                  onClick={handlePlaceOrder}
                  isDisabled={quantity < 1 || isOrdering}
                  isLoading={isOrdering}
                >
                  {isOrdering ? 'Processing...' : 'Place Order'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-3xl border border-gray-200 text-center shadow-sm">
              <span className="text-4xl mb-3 block">📦</span>
              <h3 className="font-bold text-gray-700 mb-2 text-lg">Currently Unavailable</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">This product is out of stock and cannot be ordered right now. Please check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
