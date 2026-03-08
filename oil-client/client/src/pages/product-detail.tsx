import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ChevronRight, Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductCard from "@/components/product-card";
import { oliAssetUrl, oliGetJson, oliUrl } from "@/lib/oliApi";
import type { Category, Product, SubCategory } from "@/lib/types";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function ProductDetail() {
  const { has, toggle } = useWishlist();
  const { add } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/product/:slug");
  const productSlug = params?.slug || "";

  const [selectedVariant, setSelectedVariant] = useState<string>("");

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: [oliUrl("/api/products")],
    queryFn: () => oliGetJson<Product[]>("/api/products"),
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: [oliUrl("/api/categories")],
    queryFn: () => oliGetJson<Category[]>("/api/categories"),
  });

  const product = useMemo(() => {
    if (!productSlug) return undefined;
    return products.find((p) => p.slug === productSlug);
  }, [productSlug, products]);

  const inWishlist = product ? has(product.id) : false;

  const category = useMemo(() => {
    if (!product) return undefined;
    if (product.categoryId) return categories.find((c) => c.id === product.categoryId);
    if (product.category) return categories.find((c) => c.slug === product.category || c.name === product.category);
    return undefined;
  }, [categories, product]);

  const categoryId = category?.id ?? product?.categoryId;
  const categorySlug = category?.slug ?? (product?.category ?? "");
  const categoryName = category?.name ?? (product?.category ?? "");

  const { data: subcategories = [] } = useQuery<SubCategory[]>({
    queryKey: [oliUrl(`/api/subcategories?categoryId=${categoryId ?? ""}`)],
    enabled: !!categoryId,
    queryFn: () => oliGetJson<SubCategory[]>(`/api/subcategories?categoryId=${categoryId}`),
  });

  const subcategoryName = useMemo(() => {
    if (!product?.subCategoryId) return product?.subcategory;
    return subcategories.find((sc) => sc.id === product.subCategoryId)?.name ?? product.subcategory;
  }, [product?.subCategoryId, product?.subcategory, subcategories]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    if (!categoryId) return [];
    return products
      .filter((p) => p.id !== product.id && p.categoryId === categoryId)
      .slice(0, 4);
  }, [categoryId, product, products]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (productsLoading || categoriesLoading) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-16 bg-white">
        <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link href="/">
            <span className="text-red-500 hover:text-red-600 font-medium">← Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const ratingValue =
    typeof product.rating === "number" ? product.rating : parseFloat(String(product.rating ?? "0"));

  return (
    <div className="py-16 bg-white">
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {categorySlug ? (
            <Link
              href={`/category/${categorySlug}`}
              className="text-gray-500 hover:text-gray-700 capitalize"
            >
              {categoryName || categorySlug}
            </Link>
          ) : (
            <span className="text-gray-500">Category</span>
          )}
          <ChevronRight className="h-4 w-4 text-gray-400" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="relative">
            {product.saleOffer && (
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium z-10">
                {product.saleOffer}
              </Badge>
            )}
            <img
              src={oliAssetUrl(product.imageUrl) || product.imageUrl || "/placeholder-product.jpg"}
              alt={product.name}
              className="w-full h-auto rounded-2xl shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
              }}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product badges */}
            <div className="flex gap-2">
              {product.bestseller && (
                <Badge variant="secondary" className="text-xs">
                  Bestseller
                </Badge>
              )}
              {product.newLaunch && (
                <Badge variant="secondary" className="text-xs">
                  NEW LAUNCH
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            <p className="text-lg text-gray-600">{product.shortDescription}</p>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex">
                {renderStars(ratingValue)}
              </div>
              <span className="text-lg font-semibold">{ratingValue}</span>
              <span className="text-gray-600">({product.reviewCount.toLocaleString()} reviews)</span>
            </div>

            {/* Size */}
            {product.size && (
              <div>
                <span className="text-gray-700 font-medium">Size: </span>
                <span className="text-gray-600">{product.size}</span>
              </div>
            )}

            {subcategoryName ? (
              <div>
                <span className="text-gray-700 font-medium">Subcategory: </span>
                <span className="text-gray-600">{subcategoryName}</span>
              </div>
            ) : null}

            {/* Variants */}
            {(product.variants?.colors || product.variants?.shades) && (
              <div className="space-y-2">
                <label className="text-gray-700 font-medium">
                  {product.variants.colors ? 'Color:' : 'Shade:'}
                </label>
                <Select value={selectedVariant} onValueChange={setSelectedVariant}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Select ${product.variants.colors ? 'color' : 'shade'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(product.variants.colors || product.variants.shades || []).map((variant) => (
                      <SelectItem key={variant} value={variant}>
                        {variant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <Button
                size="lg"
                className="flex-1 btn-primary"
                type="button"
                disabled={
                  !product.inStock ||
                  (!!(product.variants?.colors || product.variants?.shades) && !selectedVariant)
                }
                onClick={() => {
                  if (!product.inStock) return;
                  if (!isAuthenticated) {
                    toast({ title: "Please login to add items", variant: "destructive" });
                    setLocation("/auth/login");
                    return;
                  }
                  add(product, 1, selectedVariant || undefined);
                }}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                className={inWishlist ? "border-red-500 text-red-600 hover:bg-red-50" : undefined}
                onClick={() => product && toggle(product)}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>

            {/* Stock status */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  product.inStock ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
              <span
                className={`${product.inStock ? "text-green-600" : "text-gray-600"} font-medium`}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>
        </div>

        {/* Product Information Tabs */}
        <Tabs defaultValue="description" className="mb-16">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="how-to-use">How to Use</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ingredients" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                {product.ingredients && product.ingredients.length > 0 ? (
                  <ul className="space-y-2">
                    {product.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                        <span className="text-gray-600">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">Ingredient information not available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                {product.benefits && product.benefits.length > 0 ? (
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-600">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">Benefit information not available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="how-to-use" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>How to Use</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {product.howToUse || "Usage instructions not available for this product."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">You May Also Like</h2>
              <p className="text-gray-600">More products from {categoryName || "this category"}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
