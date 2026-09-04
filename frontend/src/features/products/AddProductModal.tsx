import { useState } from 'react';
import { Modal, Button, TextField, Input, Label } from '@heroui/react';

export default function AddProductModal({ isOpen, onClose, onCreated }: any) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = () => {
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, category, price: Number(price), stock: 0 }),
    }).then(() => {
      setName('');
      setDescription('');
      setCategory('');
      setPrice('');
      onCreated();
    });
  };

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Add Product</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                <TextField isRequired>
                  <Label>Name</Label>
                  <Input value={name} onChange={(e: any) => setName(e.target.value)} />
                </TextField>
                <TextField>
                  <Label>Category</Label>
                  <Input value={category} onChange={(e: any) => setCategory(e.target.value)} />
                </TextField>
                <TextField>
                  <Label>Description</Label>
                  <Input value={description} onChange={(e: any) => setDescription(e.target.value)} />
                </TextField>
                <TextField isRequired>
                  <Label>Price</Label>
                  <Input type="number" value={price} onChange={(e: any) => setPrice(e.target.value)} />
                </TextField>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="flat" className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm rounded-full px-6 font-medium" onClick={onClose}>Cancel</Button>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md rounded-full px-6 font-medium" onClick={handleSubmit}>Save</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
