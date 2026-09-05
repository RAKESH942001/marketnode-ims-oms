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
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm font-medium rounded-full px-6 transition-all">
          &larr; Back to Products
        </Button>
      </div>

      <Card className="mb-8 shadow-sm border border-blue-100 rounded-3xl overflow-hidden bg-gradient-to-br from-white to-blue-50/40">
        <Card.Header className="flex justify-between items-center p-6 bg-white/50 border-b border-blue-50">
          <Card.Title className="text-xl font-bold text-gray-800">Product Detail</Card.Title>
          <div className="flex items-center gap-3">
            <Chip size="sm" color={product.stock > 0 ? 'success' : 'danger'} variant="soft" className="shadow-sm">
              Stock: {product.stock}
            </Chip>
            {!isEditing && (
              <Button size="sm" variant="outline" className="bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 shadow-sm rounded-full font-medium" onClick={handleEdit}>Edit Details</Button>
            )}
          </div>
        </Card.Header>
        <Card.Content className="flex flex-col gap-6 p-6">
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
              <div className="flex gap-3 pt-4">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md rounded-full font-medium px-6" onClick={handleUpdate}>Save Changes</Button>
                <Button variant="outline" className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm rounded-full px-6 font-medium" onClick={handleCancelEdit}>Cancel</Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs text-blue-500 font-bold tracking-wider uppercase mb-1">Name</p>
                <p className="font-semibold text-lg text-gray-800">{product.name}</p>
              </div>
              <div>
                <p className="text-xs text-blue-500 font-bold tracking-wider uppercase mb-1">Category</p>
                <p className="font-medium text-gray-700">{product.category || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-blue-500 font-bold tracking-wider uppercase mb-1">Description</p>
                <p className="text-gray-600">{product.description || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-blue-500 font-bold tracking-wider uppercase mb-1">Price</p>
                <p className="font-bold text-xl text-blue-600">${product.price?.toFixed(2)}</p>
              </div>
            </>
          )}
        </Card.Content>
      </Card>

      <Card className="shadow-sm border border-blue-100 rounded-3xl overflow-hidden bg-gradient-to-br from-white to-gray-50/50">
        <Card.Header className="p-6 pb-2">
          <Card.Title className="text-xl font-bold text-gray-800">Adjust Stock</Card.Title>
        </Card.Header>
        <Card.Content className="p-6 pt-2">
          <div className="flex gap-3 items-end">
            <TextField>
              <Label>Amount</Label>
              <Input
                placeholder="e.g. 5 or -3"
                value={stockAmount}
                onChange={(e: any) => setStockAmount(e.target.value)}
              />
            </TextField>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md rounded-full font-medium px-6 h-[40px]" onClick={handleStockAdjust}>Adjust</Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
