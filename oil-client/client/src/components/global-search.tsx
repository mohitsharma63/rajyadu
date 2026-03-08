import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Search, X, Package, Tag, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { oliAssetUrl, oliGetJson } from '@/lib/oliApi';
import type { Product, Category } from '@/lib/types';

interface SearchResults {
  products: Product[];
  categories: Category[];
  totalResults: number;
}

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ 
  placeholder = "Search for products, categories...", 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);

  // Search API call
  const { data: searchResults, isLoading } = useQuery<SearchResults>({
    queryKey: ['/api/search', debouncedQuery],
    queryFn: () => oliGetJson<SearchResults>(`/api/search?q=${encodeURIComponent(debouncedQuery)}`),
    enabled: debouncedQuery.length > 0,
  });

  // Categories for popular searches
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: () => oliGetJson<Category[]>('/api/categories'),
  });

  // Recent searches (from localStorage)
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      // Check if this is a category name
      const category = categories?.find(cat => cat.name === searchTerm);
      
      if (category) {
        // Navigate to category page
        setLocation(`/category/${category.slug}`);
      } else {
        // Add to recent searches
        const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
        
        // Navigate to search results
        setLocation(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      }
      
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Popular search suggestions - using dynamic categories
  const popularSearches = categories?.slice(0, 5).map(cat => cat.name) || [];

  return (
    <div ref={searchRef} >
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className="w-full pr-10"
        />
        <button 
          type="submit" 
          className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-0">
            {query.length === 0 ? (
              // Default state - Recent and Popular searches
              <div className="p-4">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Recent Searches</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                          onClick={() => handleSearch(term)}
                        >
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Popular Searches</span>
                  </div>
                  {categories ? (
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((term, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => handleSearch(term)}
                        >
                          {term}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : isLoading ? (
              // Loading state
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                Searching...
              </div>
            ) : searchResults && (searchResults.products.length > 0 || searchResults.categories.length > 0) ? (
              // Search results
              <div>
                {/* Categories */}
                {searchResults.categories.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <Tag className="w-4 h-4" />
                      Categories ({searchResults.categories.length})
                    </div>
                    <div className="space-y-2">
                      {searchResults.categories.slice(0, 3).map((category) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.slug}`}
                          className="block p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => {
                            setIsOpen(false);
                            setQuery('');
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                              <img
                                src={oliAssetUrl(category.imageUrl) || category.imageUrl || "/placeholder-category.jpg"}
                                alt={category.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder-category.jpg";
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">{category.name}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products */}
                {searchResults.products.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      <Package className="w-4 h-4" />
                      Products ({searchResults.products.length})
                    </div>
                    <div className="space-y-2">
                      {searchResults.products.slice(0, 5).map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.slug}`}
                          className="block p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => {
                            setIsOpen(false);
                            setQuery('');
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={oliAssetUrl(product.imageUrl) || product.imageUrl || "/placeholder-product.jpg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{product.name}</div>
                              <div className="text-xs text-gray-500">
                                ₹{product.price}
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <span className="ml-2 line-through text-gray-400">
                                    ₹{product.originalPrice}
                                  </span>
                                )}
                              </div>
                            </div>
                            {product.inStock && (
                              <Badge variant="secondary" className="text-xs">
                                In Stock
                              </Badge>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* View all results */}
                <div className="p-3 border-t">
                  <Button
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => handleSearch(query)}
                  >
                    View all {searchResults.totalResults} results for "{query}"
                  </Button>
                </div>
              </div>
            ) : (
              // No results
              <div className="p-4 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-600 dark:text-gray-400">No results found for "{query}"</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try different keywords</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GlobalSearch;
