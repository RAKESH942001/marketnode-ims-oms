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
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" onPress={onBack} className="mb-6">
        &larr; Back to Storefront
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card className="w-full h-80 flex items-center justify-center bg-default-100 shadow-none border border-default-200">
            <span className="text-default-400 text-6xl">🛍️</span>
          </Card>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-primary tracking-wide uppercase">{product.category || 'General'}</span>
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

          <hr className="my-8 border-default-200" />

          {product.inStock ? (
            <div className="bg-default-50 p-6 rounded-xl border border-default-200">
              <h3 className="font-semibold mb-4 text-lg">Place Your Order</h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
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
                  variant="primary"
                  size="lg"
                  className="w-full mt-2 font-semibold shadow-md"
                  onPress={handlePlaceOrder}
                isDisabled={quantity < 1 || isOrdering}
                >
                  {isOrdering ? 'Processing...' : 'Place Order'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-default-100 p-6 rounded-xl border border-default-200 text-center">
              <h3 className="font-semibold text-default-700 mb-2">Currently Unavailable</h3>
              <p className="text-sm text-default-500">This product is out of stock and cannot be ordered right now. Please check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
