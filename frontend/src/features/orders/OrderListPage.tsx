import { useEffect, useState } from 'react';
import { Table, Chip, Button } from '@heroui/react';
import { fetchUserOrders, Order } from '../../api/orders';

export default function OrderListPage({ userId, onSelectOrder }: { userId: number, onSelectOrder: (id: number) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchUserOrders(userId)
      .then((data) => {
        setOrders(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8 px-2">
        <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
      </div>

      {error ? (
        <div className="text-danger p-4 bg-danger-50 rounded-lg">{error}</div>
      ) : loading ? (
        <div className="p-4">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center text-default-500 bg-default-50 rounded-lg border border-dashed border-default-200">
          You haven't placed any orders yet.
        </div>
      ) : (
        <div className="shadow-md border border-blue-100 rounded-3xl overflow-hidden bg-white">
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Orders table">
                <Table.Header>
                  <Table.Column isRowHeader>ORDER ID</Table.Column>
                  <Table.Column>PRODUCT</Table.Column>
                  <Table.Column>QTY</Table.Column>
                  <Table.Column>TOTAL AMOUNT</Table.Column>
                  <Table.Column>STATUS</Table.Column>
                  <Table.Column>DATE</Table.Column>
                  <Table.Column>ACTIONS</Table.Column>
                </Table.Header>
                <Table.Body>
                  {orders.map((o) => (
                    <Table.Row key={o.id} className="cursor-pointer hover:bg-blue-50 transition-colors">
                      <Table.Cell className="font-medium text-blue-600">#{o.id}</Table.Cell>
                      <Table.Cell className="font-semibold text-gray-800">{o.productName}</Table.Cell>
                      <Table.Cell>{o.quantity}</Table.Cell>
                      <Table.Cell className="font-medium">${o.totalAmount?.toFixed(2)}</Table.Cell>
                      <Table.Cell>
                        <Chip size="sm" color={o.status === 'CREATED' ? 'success' : o.status === 'CANCELLED' ? 'danger' : 'default'} variant="soft">
                          {o.status}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell className="text-gray-500">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell>
                        <Button size="sm" variant="outline" onPress={() => onSelectOrder(o.id)}>View</Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </div>
      )}
    </div>
  );
}
