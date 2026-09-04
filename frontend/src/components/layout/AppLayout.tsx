import TopBar from './TopBar';
import Sidebar from './Sidebar';

export default function AppLayout({ children, currentUser, users, onUserChange, activePage, onNavigate }: any) {
  return (
    <div className="flex flex-col h-screen">
      <TopBar currentUser={currentUser} users={users} onUserChange={onUserChange} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activePage} onNavigate={onNavigate} role={currentUser.role} />
        <main className="flex-1 overflow-y-auto bg-default-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
