import { Avatar, Dropdown } from '@heroui/react';

export default function TopBar({ currentUser, users, onUserChange }: any) {
  return (
    <header className="h-14 border-b border-default-200 bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg">MarketNode</span>
      </div>
      <Dropdown>
        <Dropdown.Trigger>
          <div className="flex items-center gap-2 cursor-pointer outline-none" role="button" tabIndex={0}>
            <span className="text-sm text-default-500">{currentUser.email}</span>
            <Avatar size="sm">
              <Avatar.Fallback>{currentUser.name.charAt(0)}</Avatar.Fallback>
            </Avatar>
          </div>
        </Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu onAction={(key: any) => {
            const user = users.find((u: any) => String(u.id) === String(key));
            if (user) onUserChange(user);
          }}>
            {users.map((u: any) => (
              <Dropdown.Item key={u.id} id={String(u.id)}>{u.name}</Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </header>
  );
}
