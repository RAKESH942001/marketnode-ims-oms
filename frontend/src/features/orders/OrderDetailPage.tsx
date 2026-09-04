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
    <div className="max-w-4xl">
      <div className="mb-6">
        <Button variant="flat" onClick={onBack} className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm font-medium rounded-full px-6 transition-all">
          &larr; Back to Orders
        </Button>
      </div>

      <div className="flex justify-between items-center mb-8 px-2">
        <h1 className="text-3xl font-bold text-gray-800">Order <span className="text-blue-600">#{order.id}</span></h1>
        {order.status === 'CREATED' && (
          <Button
           variant="flat"
           className="text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm rounded-full px-6 font-medium transition-all"
           onClick={handleCancel}
           isDisabled={isCancelling}
           isLoading={isCancelling}
          >
           {isCancelling ? "Cancelling..." : "Cancel Order"}
          </Button>
        )}
      </div>

      <Card className="shadow-md border border-blue-100 rounded-3xl overflow-hidden bg-gradient-to-br from-white to-blue-50/40">
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
              <hr className="my-3 border-blue-100" />
            </div>

            <div>
              <p className="text-xs text-blue-500 font-bold tracking-wider uppercase mb-1">Product</p>
              <p className="font-semibold text-xl text-gray-800">{order.productName}</p>
            </div>

            <div>
              <p className="text-xs text-blue-500 font-bold tracking-wider uppercase mb-1">Quantity</p>
              <p className="font-medium text-lg">{order.quantity}</p>
            </div>

            <div>
              <p className="text-xs text-blue-500 font-bold tracking-wider uppercase mb-1">Unit Price</p>
              <p className="font-medium text-lg">${order.unitPrice?.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-xs text-blue-500 font-bold tracking-wider uppercase mb-1">Total Amount</p>
              <p className="font-bold text-2xl text-blue-600">${order.totalAmount?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
