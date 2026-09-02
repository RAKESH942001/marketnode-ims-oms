import { useState } from 'react';
import AppLayout from './components/layout/AppLayout';
import ProductListPage from './features/products/ProductListPage';
import ProductDetailPage from './features/products/ProductDetailPage';

const USERS = [
  { id: 1, name: 'Alice Martin', email: 'alice@marketnode.com' },
  { id: 2, name: 'Bob Chen', email: 'bob@marketnode.com' },
  { id: 3, name: 'Carol Smith', email: 'carol@marketnode.com' },
];

function App() {
  const [page, setPage] = useState('list');
  const [selectedProductId, setSelectedProductId] = useState<any>(null);
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
    >
      {content}
    </AppLayout>
  );
}

export default App;
