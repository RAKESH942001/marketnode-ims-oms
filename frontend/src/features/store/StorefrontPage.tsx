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
    return <EmptyState message="No Products Available. Check back later for new arrivals." />;
  }

  return (
    <div>
      <div className="mb-8 px-2">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Storefront</h1>
        <p className="text-blue-600 font-medium">Browse our latest products.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((p) => (
          <Card key={p.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-blue-100 rounded-3xl overflow-hidden bg-gradient-to-br from-white to-blue-50/30" onClick={() => onSelectProduct(p.id)}>
            <div className="p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full tracking-wider uppercase">{p.category || 'General'}</span>
                <Chip size="sm" color={p.inStock ? 'success' : 'danger'} variant="soft" className="shadow-sm">
                  {p.inStock ? 'In Stock' : 'Out of Stock'}
                </Chip>
              </div>
              <h3 className="text-xl font-bold text-gray-800 truncate">{p.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">
                {p.description || 'No description available.'}
              </p>
              <div className="mt-4 pt-4 border-t border-blue-100 flex flex-col justify-between items-start gap-4">
                <span className="text-2xl font-bold text-blue-700">${p.price.toFixed(2)}</span>
                <Button
                  size="sm"
                  className={
                    p.inStock
                      ? 'w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md rounded-full font-medium'
                      : 'w-full rounded-full font-medium'
                  }
                  variant={p.inStock ? 'primary' : 'tertiary'}
                  isDisabled={!p.inStock}
                >
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
