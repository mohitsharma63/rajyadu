import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product, Category, SubCategory, FilterOptions } from "@/lib/types";
import { oliGetJson, oliUrl } from "@/lib/oliApi";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const categorySlug = params?.slug || "";
  const [location] = useLocation();

  const querySub = (() => {
    const idx = location.indexOf("?");
    if (idx === -1) return "";
    const qs = location.slice(idx + 1);
    return new URLSearchParams(qs).get("sub") ?? "";
  })();

  const [selectedSubcategory, setSelectedSubcategory] = useState(querySub || "all");
  const [selectedSort, setSelectedSort] = useState("popular");
  const [selectedTag, setSelectedTag] = useState("all");

  useEffect(() => {
    setSelectedSubcategory(querySub || "all");
  }, [categorySlug, querySub]);

  // Reset filters when category changes
  useEffect(() => {
    setSelectedTag("all");
    setSelectedSort("popular");
    // Keep subcategory if it's in the URL, otherwise reset to "all"
    if (!querySub) {
      setSelectedSubcategory("all");
    }
  }, [categorySlug]);

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: [oliUrl("/api/categories")],
    queryFn: () => oliGetJson<Category[]>("/api/categories"),
  });

  const category = categories?.find((c) => c.slug === categorySlug);
  const categoryId = category?.id;

  const { data: subcategories } = useQuery<SubCategory[]>({
    queryKey: [oliUrl(`/api/subcategories?categoryId=${categoryId ?? ""}`)],
    enabled: !!categoryId,
    queryFn: () => oliGetJson<SubCategory[]>(`/api/subcategories?categoryId=${categoryId}`),
  });

  const { data: allProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: [oliUrl("/api/products")],
    queryFn: () => oliGetJson<Product[]>("/api/products"),
  });

  const { data: filterOptions, isLoading: filtersLoading } = useQuery<FilterOptions>({
    queryKey: [oliUrl("/api/products/filters")],
    queryFn: () => oliGetJson<FilterOptions>("/api/products/filters"),
    retry: 2,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const selectedSubCategoryId =
    selectedSubcategory === "all"
      ? undefined
      : subcategories?.find((sc) => sc.slug === selectedSubcategory)?.id;

  // Filter and sort products
  const products = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    if (!categoryId && !categorySlug) return [];

    let filtered = allProducts.filter((product) => {
      // Match category by ID or slug
      const matchesCategory = categoryId 
        ? product.categoryId === categoryId
        : (product.category === categorySlug || 
           product.category === category?.slug ||
           product.category?.toLowerCase() === categorySlug.toLowerCase());

      if (!matchesCategory) return false;

      // Filter by subcategory
      if (selectedSubcategory !== "all") {
        if (selectedSubCategoryId !== undefined) {
          if (product.subCategoryId !== selectedSubCategoryId) return false;
        } else {
          const productSubcategory = product.subcategory || product.subCategoryId?.toString();
          if (productSubcategory !== selectedSubcategory) return false;
        }
      }

      // Filter by tag
      if (selectedTag !== "all") {
        let productTags: string[] = [];
        if (product.tags) {
          if (typeof product.tags === 'string') {
            productTags = product.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
          } else if (Array.isArray(product.tags)) {
            productTags = product.tags.map(t => typeof t === 'string' ? t.trim() : String(t).trim()).filter(t => t.length > 0);
          }
        }
        if (productTags.length === 0 || !productTags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // Sort products
    filtered = [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case "price-low": {
          const priceA = typeof a.price === 'string' ? parseFloat(a.price) : Number(a.price) || 0;
          const priceB = typeof b.price === 'string' ? parseFloat(b.price) : Number(b.price) || 0;
          return priceA - priceB;
        }
        case "price-high": {
          const priceA = typeof a.price === 'string' ? parseFloat(a.price) : Number(a.price) || 0;
          const priceB = typeof b.price === 'string' ? parseFloat(b.price) : Number(b.price) || 0;
          return priceB - priceA;
        }
        case "newest":
          return (b.newLaunch ? 1 : 0) - (a.newLaunch ? 1 : 0);
        case "rating": {
          const ratingA = typeof a.rating === 'string' ? parseFloat(a.rating) : Number(a.rating) || 0;
          const ratingB = typeof b.rating === 'string' ? parseFloat(b.rating) : Number(b.rating) || 0;
          return ratingB - ratingA;
        }
        case "popular":
        default:
          // Sort by bestseller first, then featured, then by rating
          const bestsellerDiff = (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0);
          if (bestsellerDiff !== 0) return bestsellerDiff;
          const featuredDiff = (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
          if (featuredDiff !== 0) return featuredDiff;
          const ratingA = typeof a.rating === 'string' ? parseFloat(a.rating) : Number(a.rating) || 0;
          const ratingB = typeof b.rating === 'string' ? parseFloat(b.rating) : Number(b.rating) || 0;
          return ratingB - ratingA;
      }
    });

    return filtered;
  }, [allProducts, categoryId, categorySlug, category?.slug, selectedSubcategory, selectedSubCategoryId, selectedTag, selectedSort]);

  // Get available tags for current category products
  const availableTags = useMemo(() => {
    if (!filterOptions?.tags || !products || products.length === 0) return [];
    
    // Get all tags from filtered products
    const productTagsSet = new Set<string>();
    products.forEach(product => {
      if (product.tags) {
        let tags: string[] = [];
        if (typeof product.tags === 'string') {
          tags = product.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
        } else if (Array.isArray(product.tags)) {
          tags = product.tags.map(t => typeof t === 'string' ? t.trim() : String(t).trim()).filter(t => t.length > 0);
        }
        tags.forEach(tag => productTagsSet.add(tag.toLowerCase()));
      }
    });

    // Return only tags that exist in filterOptions and in current products
    return filterOptions.tags.filter(tag => productTagsSet.has(tag.toLowerCase()));
  }, [filterOptions?.tags, products]);

  if (categoriesLoading) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-48 mb-8" />
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
          <Link href="/">
            <span className="text-red-500 hover:text-red-600 font-medium">← Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white">
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-gray-900 font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name}</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">{category.description}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={selectedSubcategory} onValueChange={(value) => setSelectedSubcategory(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {(subcategories ?? []).map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.slug}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSort} onValueChange={setSelectedSort}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {(filterOptions?.sortOptions || [
                { value: "popular", label: "Most Popular" },
                { value: "price-low", label: "Price: Low to High" },
                { value: "price-high", label: "Price: High to Low" },
                { value: "newest", label: "Newest First" },
                { value: "rating", label: "Highest Rated" },
              ]).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {availableTags.length > 0 && (
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {/* Product count */}
            <div className="text-center mt-12">
              <p className="text-gray-600">
                Showing {products.length} product{products.length !== 1 ? 's' : ''} in {category.name}
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-8">Try adjusting your filters or check back later.</p>
            <Link href="/">
              <span className="text-red-500 hover:text-red-600 font-medium">← Continue Shopping</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
