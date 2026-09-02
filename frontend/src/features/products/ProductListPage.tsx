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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button variant="primary" onPress={() => setAddOpen(true)}>
          + Add Product
        </Button>
      </div>

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
            </Table.Header>
            <Table.Body>
              {products.map((p: any) => (
                <Table.Row key={p.id} className="cursor-pointer" onAction={() => onSelectProduct(p.id)}>
                  <Table.Cell>{p.id}</Table.Cell>
                  <Table.Cell className="font-medium">{p.name}</Table.Cell>
                  <Table.Cell>{p.category || '—'}</Table.Cell>
                  <Table.Cell className="text-default-500">{p.description || '—'}</Table.Cell>
                  <Table.Cell>${p.price?.toFixed(2)}</Table.Cell>
                  <Table.Cell>
                    <Chip size="sm" color={p.stock > 0 ? 'success' : 'danger'}>
                      <Chip.Label>{p.stock}</Chip.Label>
                    </Chip>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

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
