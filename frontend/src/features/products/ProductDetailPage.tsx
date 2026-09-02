import { useEffect, useState } from 'react';
import { Button, Card, TextField, Input, Label, Chip } from '@heroui/react';

export default function ProductDetailPage({ id, onBack }: any) {
  const [product, setProduct] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stockAmount, setStockAmount] = useState('');

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => setProduct(data));
  }, [id]);

  const handleEdit = () => {
    setEditData({ name: product.name, description: product.description || '', category: product.category || '', price: product.price });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditData(null);
    setIsEditing(false);
  };

  const handleUpdate = () => {
    fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, ...editData }),
    }).then(() => {
      window.location.reload();
    });
  };

  const handleStockAdjust = () => {
    fetch(`/api/products/${product.id}/stock?amount=${stockAmount}`, {
      method: 'PATCH',
    })
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setStockAmount('');
      });
  };

  if (!product) return null;

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" onPress={onBack} className="mb-4">
        ← Back to products
      </Button>

      <Card className="mb-6">
        <Card.Header className="flex justify-between items-center">
          <Card.Title>Product Detail</Card.Title>
          <div className="flex items-center gap-2">
            <Chip size="sm" color={product.stock > 0 ? 'success' : 'danger'}>
              <Chip.Label>Stock: {product.stock}</Chip.Label>
            </Chip>
            {!isEditing && (
              <Button size="sm" variant="outline" onPress={handleEdit}>Edit</Button>
            )}
          </div>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          {isEditing ? (
            <>
              <TextField>
                <Label>Name</Label>
                <Input
                  value={editData.name}
                  onChange={(e: any) => setEditData({ ...editData, name: e.target.value })}
                />
              </TextField>
              <TextField>
                <Label>Category</Label>
                <Input
                  value={editData.category}
                  onChange={(e: any) => setEditData({ ...editData, category: e.target.value })}
                />
              </TextField>
              <TextField>
                <Label>Description</Label>
                <Input
                  value={editData.description}
                  onChange={(e: any) => setEditData({ ...editData, description: e.target.value })}
                />
              </TextField>
              <TextField>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={String(editData.price)}
                  onChange={(e: any) => setEditData({ ...editData, price: Number(e.target.value) })}
                />
              </TextField>
              <div className="flex gap-2">
                <Button variant="primary" onPress={handleUpdate}>Save Changes</Button>
                <Button variant="outline" onPress={handleCancelEdit}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm text-default-500">Name</p>
                <p className="font-medium">{product.name}</p>
              </div>
              <div>
                <p className="text-sm text-default-500">Category</p>
                <p>{product.category || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-default-500">Description</p>
                <p>{product.description || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-default-500">Price</p>
                <p className="font-medium">${product.price?.toFixed(2)}</p>
              </div>
            </>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Adjust Stock</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="flex gap-3 items-end">
            <TextField>
              <Label>Amount</Label>
              <Input
                placeholder="e.g. 5 or -3"
                value={stockAmount}
                onChange={(e: any) => setStockAmount(e.target.value)}
              />
            </TextField>
            <Button variant="primary" onPress={handleStockAdjust}>Adjust</Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
