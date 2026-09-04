import { ListBox } from '@heroui/react';

const staffItems = [
  { id: 'inventory', label: 'Inventory (Products)', disabled: false },
  { id: 'suppliers', label: 'Suppliers', disabled: true },
  { id: 'warehouses', label: 'Warehouses', disabled: true },
  { id: 'reports', label: 'Reports', disabled: true },
];

const customerItems = [
  { id: 'storefront', label: 'Storefront', disabled: false },
  { id: 'orders', label: 'My Orders', disabled: false },
  { id: 'billing', label: 'Billing', disabled: true },
];

export default function Sidebar({ active, onNavigate, role }: any) {
  const items = role === 'STAFF' ? staffItems : customerItems;
  const title = role === 'STAFF' ? 'Inventory Management' : 'Store';

  return (
    <aside className="w-56 border-r border-default-200 bg-default-50 min-h-0 shrink-0">
      <div className="p-3">
        <p className="text-xs font-semibold text-default-400 uppercase tracking-wider px-2 mb-2">
          {title}
        </p>
        <ListBox
          aria-label="Navigation"
          selectionMode="single"
          selectedKeys={new Set([active])}
          onSelectionChange={(keys: any) => {
            const selected = Array.from(keys)[0];
            if (selected) onNavigate(selected);
          }}
          disabledKeys={new Set(items.filter((i) => i.disabled).map((i) => i.id))}
        >
          {items.map((item) => (
            <ListBox.Item key={item.id} id={item.id}>{item.label}</ListBox.Item>
          ))}
        </ListBox>
      </div>
    </aside>
  );
}
