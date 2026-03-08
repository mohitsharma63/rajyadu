import React from 'react';
import { Link, useLocation } from 'wouter';
import { ChevronDown, Package, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { oliGetJson } from '@/lib/oliApi';
import type { Category, SubCategory } from '@/lib/types';

interface DynamicCategoriesProps {
  className?: string;
  showProductCount?: boolean;
  layout?: 'horizontal' | 'grid' | 'dropdown';
}

const DynamicCategories: React.FC<DynamicCategoriesProps> = ({ 
  className = '',
  showProductCount = false,
  layout = 'horizontal'
}) => {
  const [location] = useLocation();

  // Fetch categories and subcategories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: () => oliGetJson<Category[]>('/api/categories'),
  });

  const { data: subcategories, isLoading: subcategoriesLoading } = useQuery<SubCategory[]>({
    queryKey: ['/api/subcategories'],
    queryFn: () => oliGetJson<SubCategory[]>('/api/subcategories'),
  });

  // Group subcategories by category ID
  const subcategoriesByCategoryId = React.useMemo(() => {
    if (!subcategories) return new Map();
    
    const map = new Map<number, SubCategory[]>();
    subcategories.forEach((sub) => {
      if (sub.categoryId) {
        const subs = map.get(sub.categoryId) || [];
        subs.push(sub);
        map.set(sub.categoryId, subs);
      }
    });
    return map;
  }, [subcategories]);

  const isLoading = categoriesLoading || subcategoriesLoading;

  // Check if category link is active
  const isActiveLink = (href: string) => {
    return location === href || location.startsWith(href + '?');
  };

  if (layout === 'grid') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 ${className}`}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-24 w-full" />
              <CardContent className="p-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4 mt-1" />
              </CardContent>
            </Card>
          ))
        ) : (
          categories?.map((category) => {
            const subs = subcategoriesByCategoryId.get(category.id) || [];
            const productCount = subs.length; // You could fetch actual product count if needed
            
            return (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={category.imageUrl || ''}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-full h-full flex items-center justify-center bg-gray-100';
                        placeholder.innerHTML = `<div class="text-gray-400"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>`;
                        e.target.parentNode?.replaceChild(placeholder, e.target);
                      }}
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm text-center mb-1">{category.name}</h3>
                    {showProductCount && (
                      <div className="flex justify-center">
                        <Badge variant="secondary" className="text-xs">
                          {productCount} items
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    );
  }

  if (layout === 'dropdown') {
    return (
      <div className={`space-y-2 ${className}`}>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : (
          categories?.map((category) => {
            const subs = subcategoriesByCategoryId.get(category.id) || [];
            const active = isActiveLink(`/category/${category.slug}`);

            return (
              <div key={category.id} className="space-y-1">
                <Link
                  href={`/category/${category.slug}`}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    active ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={category.imageUrl || ''}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-full h-full flex items-center justify-center bg-gray-100';
                        placeholder.innerHTML = `<div class="text-gray-400"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>`;
                        e.target.parentNode?.replaceChild(placeholder, e.target);
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{category.name}</div>
                    {showProductCount && (
                      <div className="text-xs text-gray-500">{subs.length} subcategories</div>
                    )}
                  </div>
                  {subs.length > 0 && (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </Link>
                
                {/* Subcategories */}
                {subs.length > 0 && (
                  <div className="ml-11 space-y-1">
                    {subs.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/category/${category.slug}?sub=${encodeURIComponent(sub.slug)}`}
                        className="block p-2 text-sm text-gray-600 hover:text-green-600 rounded hover:bg-gray-50"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  }

  // Default horizontal layout (for navigation)
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {isLoading ? (
        <div className="flex items-center gap-4">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          <span className="text-sm text-gray-500">Loading categories...</span>
        </div>
      ) : (
        categories?.map((category) => {
          const subs = subcategoriesByCategoryId.get(category.id) || [];
          const active = isActiveLink(`/category/${category.slug}`);
          const itemClass = `text-sm font-medium transition-colors px-4 py-2 whitespace-nowrap ${
            active ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
          }`;

          if (subs.length === 0) {
            return (
              <Link key={category.id} href={`/category/${category.slug}`} className={itemClass}>
                {category.name}
              </Link>
            );
          }

          return (
            <div key={category.id} className="relative group">
              <Link
                href={`/category/${category.slug}`}
                className={`${itemClass} inline-flex items-center gap-1`}
              >
                {category.name}
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </Link>

              {/* Dropdown for subcategories */}
              <div className="absolute left-0 top-full z-50 hidden min-w-56 rounded-md border bg-white shadow-lg group-hover:block">
                <div className="p-2">
                  {subs.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/category/${category.slug}?sub=${encodeURIComponent(sub.slug)}`}
                      className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default DynamicCategories;
