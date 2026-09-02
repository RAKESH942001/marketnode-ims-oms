import { ListBox } from '@heroui/react';

const sidebarItems = [
  { id: 'products', label: 'Products', disabled: false },
  { id: 'suppliers', label: 'Suppliers', disabled: true },
  { id: 'warehouses', label: 'Warehouses', disabled: true },
  { id: 'billing', label: 'Billing', disabled: true },
  { id: 'reports', label: 'Reports', disabled: true },
];

export default function Sidebar({ active }: any) {
  return (
    <aside className="w-56 border-r border-default-200 bg-default-50 min-h-0 shrink-0">
      <div className="p-3">
        <p className="text-xs font-semibold text-default-400 uppercase tracking-wider px-2 mb-2">
          Inventory Management
        </p>
        <ListBox
          aria-label="Navigation"
          selectionMode="single"
          selectedKeys={new Set([active])}
          disabledKeys={new Set(sidebarItems.filter((i) => i.disabled).map((i) => i.id))}
        >
          {sidebarItems.map((item) => (
            <ListBox.Item key={item.id} id={item.id}>{item.label}</ListBox.Item>
          ))}
        </ListBox>
      </div>
    </aside>
  );
}
