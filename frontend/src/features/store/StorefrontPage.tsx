import { useEffect, useState } from 'react';
import { Card, Button, Chip } from '@heroui/react';
import { fetchStoreProducts, StoreProduct } from '../../api/store';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function StorefrontPage({ onSelectProduct }: any) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreProducts()
      .then((data) => {
        setProducts(data);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-danger">{error}</div>;

  if (products.length === 0) {
    return <EmptyState message ="No Products Available. Check back later for new arrivals." />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Storefront</h1>
        <p className="text-default-500">Browse our latest products.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelectProduct(p.id)}>
            <div className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-primary">{p.category || 'General'}</span>
                <Chip size="sm" color={p.inStock ? 'success' : 'danger'} variant="soft">
                  {p.inStock ? 'In Stock' : 'Out of Stock'}
                </Chip>
              </div>
              <h3 className="text-lg font-bold truncate">{p.name}</h3>
              <p className="text-sm text-default-500 line-clamp-2 min-h-[40px]">
                {p.description || 'No description available.'}
              </p>
              <div className="mt-4 pt-4 border-t border-default-100 flex justify-between items-center">
                <span className="text-xl font-bold">${p.price.toFixed(2)}</span>
                <Button size="sm" variant={p.inStock ? 'primary' : 'outline'} isDisabled={!p.inStock}>
                  {p.inStock ? 'View Details' : 'Unavailable'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
