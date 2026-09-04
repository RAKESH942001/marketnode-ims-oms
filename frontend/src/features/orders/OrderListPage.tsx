import { useEffect, useState } from 'react';
import { Table, Chip } from '@heroui/react';
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">My Orders</h1>
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
              </Table.Header>
              <Table.Body>
                {orders.map((o) => (
                  <Table.Row key={o.id} className="cursor-pointer hover:bg-default-100" onAction={() => onSelectOrder(o.id)}>
                    <Table.Cell>#{o.id}</Table.Cell>
                    <Table.Cell className="font-medium">{o.productName}</Table.Cell>
                    <Table.Cell>{o.quantity}</Table.Cell>
                    <Table.Cell>${o.totalAmount?.toFixed(2)}</Table.Cell>
                    <Table.Cell>
                      <Chip size="sm" color={o.status === 'CREATED' ? 'success' : 'default'} variant="soft">
                        {o.status}
                      </Chip>
                    </Table.Cell>
                    <Table.Cell className="text-default-500">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}
    </div>
  );
}
