import { useEffect, useState } from 'react';
import { Button, Chip, Card } from '@heroui/react';
import { fetchOrderById, cancelOrder, Order } from '../../api/orders';

export default function OrderDetailPage({ id, onBack }: { id: number, onBack: () => void }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadOrder = () => {
    setLoading(true);
    fetchOrderById(id)
      .then((data) => {
        setOrder(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!order || order.status !== 'CREATED') return;
    setIsCancelling(true);
    try {
      await cancelOrder(order.id);
      loadOrder(); // Reload the order to get the updated status
    } catch (err: any) {
      setError(err.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) return <div className="p-4">Loading order details...</div>;
  if (error || !order) return <div className="text-danger p-4 bg-danger-50 rounded-lg">{error || 'Order not found'}</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <Button variant="ghost" onClick={onBack} size="sm">
          &larr; Back to Orders
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
        {order.status === 'CREATED' && (
          <Button
           variant="outline"
  className="text-red-600 border-red-600 hover:bg-red-50"
  onClick={handleCancel}
  isDisabled={isCancelling}
          >
           {isCancelling ? "Cancelling..." : "Cancel Order"}
          </Button>
        )}
      </div>

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <p className="text-sm text-default-500 font-medium mb-1">Status</p>
              <Chip size="sm" color={order.status === 'CREATED' ? 'success' : 'default'} variant="soft">
                {order.status}
              </Chip>
            </div>
            <div>
              <p className="text-sm text-default-500 font-medium mb-1">Date Placed</p>
              <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
            </div>

            <div className="col-span-2">
              <hr className="my-2 border-default-200" />
            </div>

            <div>
              <p className="text-sm text-default-500 font-medium mb-1">Product</p>
              <p className="font-medium text-lg">{order.productName}</p>
            </div>

            <div>
              <p className="text-sm text-default-500 font-medium mb-1">Quantity</p>
              <p className="font-medium">{order.quantity}</p>
            </div>

            <div>
              <p className="text-sm text-default-500 font-medium mb-1">Unit Price</p>
              <p className="font-medium">${order.unitPrice?.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-sm text-default-500 font-medium mb-1">Total Amount</p>
              <p className="font-semibold text-xl text-primary">${order.totalAmount?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
