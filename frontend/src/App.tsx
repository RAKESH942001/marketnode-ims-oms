import { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import ProductListPage from './features/products/ProductListPage';
import ProductDetailPage from './features/products/ProductDetailPage';
import OrderListPage from './features/orders/OrderListPage';
import OrderDetailPage from './features/orders/OrderDetailPage';


const USERS = [
  { id: 1, name: 'Alice Martin', email: 'alice@marketnode.com' },
  { id: 2, name: 'Bob Chen', email: 'bob@marketnode.com' },
  { id: 3, name: 'Carol Smith', email: 'carol@marketnode.com' },
];

function App() {
  const [page, setPage] = useState('list');
  const [selectedProductId, setSelectedProductId] = useState<any>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState(USERS[0]);


  const content = (() => {
    if (page === 'detail' && selectedProductId) {
      return (
        <ProductDetailPage
          id={selectedProductId}
          onBack={() => setPage('list')}
        />
      );
    }
    if (page === 'order-detail' && selectedOrderId) {
      return (
        <OrderDetailPage
          id={selectedOrderId}
          onBack={() => setPage('orders')}
        />
      );
    }
    if (page === 'orders') {
      return (
        <OrderListPage
          userId={currentUser.id}
          onSelectOrder={(id: any) => {
            setSelectedOrderId(id);
            setPage('order-detail');
          }}
        />
      );
    }
    return (
      <ProductListPage
        onSelectProduct={(id: any) => {
          setSelectedProductId(id);
          setPage('detail');
        }}
      />
    );
  })();

  return (
    <AppLayout
      currentUser={currentUser}
      users={USERS}
      onUserChange={setCurrentUser}
      activePage={page === 'orders' || page === 'order-detail' ? 'orders' : 'products'}
      onNavigate={(navPage: string) => {
        if (navPage === 'products') setPage('list');
        if (navPage === 'orders') setPage('orders');
      }}
    >
      {content}
    </AppLayout>
  );
}

export default App;
