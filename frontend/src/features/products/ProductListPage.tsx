import { useEffect, useState } from 'react';
import { Table, Button, Chip } from '@heroui/react';
import AddProductModal from './AddProductModal';

export default function ProductListPage({ onSelectProduct }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [isAddOpen, setAddOpen] = useState(false);

  const loadProducts = () => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => setProducts(data));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8 px-2">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md rounded-full px-6 font-medium" onClick={() => setAddOpen(true)}>
          + Add Product
        </Button>
      </div>

      <div className="shadow-md border border-blue-100 rounded-3xl overflow-hidden bg-white">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Products table">
              <Table.Header>
                <Table.Column isRowHeader>ID</Table.Column>
                <Table.Column>NAME</Table.Column>
                <Table.Column>CATEGORY</Table.Column>
                <Table.Column>DESCRIPTION</Table.Column>
                <Table.Column>PRICE</Table.Column>
                <Table.Column>STOCK</Table.Column>
                <Table.Column>ACTIONS</Table.Column>
              </Table.Header>
              <Table.Body>
                {products.map((p: any) => (
                  <Table.Row key={p.id} className="cursor-pointer hover:bg-blue-50 transition-colors">
                    <Table.Cell className="font-medium text-blue-600">{p.id}</Table.Cell>
                    <Table.Cell className="font-semibold text-gray-800">{p.name}</Table.Cell>
                    <Table.Cell>{p.category || '—'}</Table.Cell>
                    <Table.Cell className="text-gray-500">{p.description || '—'}</Table.Cell>
                    <Table.Cell className="font-medium">${p.price?.toFixed(2)}</Table.Cell>
                    <Table.Cell>
                      <Chip size="sm" color={p.stock > 0 ? 'success' : 'danger'} variant="soft">
                        <Chip.Label>{p.stock}</Chip.Label>
                      </Chip>
                    </Table.Cell>
                    <Table.Cell>
                      <Button size="sm" variant="outline" onPress={() => onSelectProduct(p.id)}>View</Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>

      <AddProductModal
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setAddOpen(false);
          loadProducts();
        }}
      />
    </div>
  );
}
