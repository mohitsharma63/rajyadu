import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import ProductCard from "@/components/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product, Category } from "@/lib/types";
import { oliAssetUrl, oliGetJson, oliUrl } from "@/lib/oliApi";

interface SearchResults {
  products: Product[];
  categories: Category[];
  totalResults: number;
}

export default function SearchPage() {
  const [location] = useLocation();
  
  // Get search query from URL
  const query = (() => {
    const idx = location.indexOf("?");
    if (idx === -1) return "";
    const qs = location.slice(idx + 1);
    return new URLSearchParams(qs).get("q") ?? "";
  })();

  const { data, isLoading } = useQuery<SearchResults>({
    queryKey: [oliUrl(`/api/search?q=${encodeURIComponent(query)}`)],
    queryFn: () => oliGetJson<SearchResults>(`/api/search?q=${encodeURIComponent(query)}`),
    enabled: !!query && query.trim().length > 0,
  });

  if (!query || query.trim().length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Search</h1>
            <p className="text-gray-600">Enter a search query to find products and categories</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-600">
            {isLoading ? "Searching..." : `Found ${data?.totalResults || 0} results`}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            <div>
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-64 w-full" />
                    <CardContent className="p-6 space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Categories Section */}
            {data?.categories && data.categories.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {data.categories.map((category) => (
                    <Link key={category.id} href={`/category/${category.slug}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="aspect-square overflow-hidden bg-gray-100">
                          <img
                            src={oliAssetUrl(category.imageUrl) || undefined}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg text-center">{category.name}</h3>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Products Section */}
            {data?.products && data.products.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Products ({data.products.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {data.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* No Results */}
            {data && data.totalResults === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-gray-600 mb-4">
                  No results found for "{query}"
                </p>
                <p className="text-gray-500">
                  Try different keywords or browse our categories
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

