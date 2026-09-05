import { useEffect, useState } from 'react';
import { Button, Chip, Card } from '@heroui/react';
import { fetchOrderById, cancelOrder, Order } from '../../api/orders';

export default function OrderDetailPage({ id, onBack }: { id: number, onBack: () => void }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showToast, setShowToast] = useState(false);

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

    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    setIsCancelling(true);
    try {
      await cancelOrder(order.id);
      loadOrder(); // Reload the order to get the updated status
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) return <div className="p-4">Loading order details...</div>;
  if (error || !order) return <div className="text-danger p-4 bg-danger-50 rounded-lg">{error || 'Order not found'}</div>;

  return (
    <div className="max-w-3xl relative">
      <div className="mb-6">
        <Button variant="outline" onPress={onBack} className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm font-medium rounded-full px-6 transition-all">
          &larr; Back to Orders
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Order <span className="text-blue-600">#{order.id}</span></h1>
        {order.status === 'CREATED' && (
          <Button 
            variant="outline" 
            className="text-red-600 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm rounded-full px-6 font-medium transition-all"
            onPress={handleCancel} 
            isLoading={isCancelling}
          >
            {isCancelling ? "Cancelling..." : "Cancel Order"}
          </Button>
        )}
      </div>

      <Card className="shadow-sm border border-blue-100 rounded-3xl overflow-hidden bg-gradient-to-br from-white to-blue-50/40">
        <div className="p-8">
          <div className="grid grid-cols-2 gap-y-8 gap-x-8">
            <div>
              <p className="text-xs text-blue-500 font-bold tracking-wider uppercase mb-2">Status</p>
              <Chip size="sm" color={order.status === 'CREATED' ? 'success' : order.status === 'CANCELLED' ? 'danger' : 'default'} variant="soft" className="shadow-sm">
                {order.status}
              </Chip>
            </div>
            <div>
              <p className="text-xs text-blue-500 font-bold tracking-wider uppercase mb-2">Date Placed</p>
              <p className="font-semibold text-gray-800">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            
            <div className="col-span-2">
              <hr className="my-2 border-blue-100/50" />
            </div>

            <div>
              <p className="text-xs text-blue-500 font-bold tracking-wider uppercase mb-2">Product</p>
              <p className="font-semibold text-xl text-gray-800">{order.productName}</p>
            </div>
            
            <div>
              <p className="text-xs text-blue-500 font-bold tracking-wider uppercase mb-2">Quantity</p>
              <p className="font-medium text-lg text-gray-700">{order.quantity}</p>
            </div>

            <div>
              <p className="text-xs text-blue-500 font-bold tracking-wider uppercase mb-2">Unit Price</p>
              <p className="font-medium text-lg text-gray-700">${order.unitPrice?.toFixed(2)}</p>
            </div>

            <div>
              <p className="text-xs text-blue-500 font-bold tracking-wider uppercase mb-2">Total Amount</p>
              <p className="font-bold text-2xl text-blue-600">${order.totalAmount?.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </Card>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all animate-bounce">
          <div className="bg-white/20 rounded-full p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="font-medium">Order cancelled successfully</span>
        </div>
      )}
    </div>
  );
}
