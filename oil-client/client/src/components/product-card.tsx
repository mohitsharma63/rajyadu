import { Link } from "wouter";
import { Eye, Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { oliAssetUrl } from "@/lib/oliApi";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const { has, toggle } = useWishlist();
  const { add } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const canAddToCart = !!product.inStock;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  const ratingValue =
    typeof product.rating === "number"
      ? product.rating
      : parseFloat(String(product.rating ?? "0"));

  const inWishlist = has(product.id);

  return (
    <Card className={`product-card group overflow-hidden transition-shadow hover:shadow-lg ${className}`}>
      <div className="relative">
        {product.saleOffer && (
          <Badge className="sale-badge">
            {product.saleOffer}
          </Badge>
        )}

        {!product.inStock && (
          <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-medium z-10">
            Out of stock
          </Badge>
        )}

        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-full bg-white/90 text-black shadow-sm hover:bg-white dark:bg-black/60 dark:text-white dark:hover:bg-black/70"
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            onClick={() => toggle(product)}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
          </Button>

          <Link href={`/product/${product.slug}`}>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-9 w-9 rounded-full bg-white/90 text-black shadow-sm hover:bg-white dark:bg-black/60 dark:text-white dark:hover:bg-black/70"
              aria-label="View product"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <Link href={`/product/${product.slug}`}>
          <img
            src={oliAssetUrl(product.imageUrl) || product.imageUrl || "/placeholder-product.jpg"}
            alt={product.name}
            className="product-image h-64 w-full cursor-pointer  transition-transform duration-300 group-hover:scale-[1.03]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
            }}
          />
        </Link>
      </div>

      <CardContent className="p-6">
        <div className="flex items-center mb-2">
          <div className="star-rating">
            {renderStars(ratingValue)}
          </div>
          <span className="text-gray-600 text-sm ml-2">{ratingValue}</span>
        </div>

        <Link href={`/product/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-red-500 transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3">
          {product.shortDescription}
        </p>

        {product.size && (
          <p className="text-gray-500 text-xs mb-3">{product.size}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {product.variants?.colors || product.variants?.shades ? (
            <Link href={`/product/${product.slug}`}>
              <Button size="sm" className="btn-primary h-9 px-4 text-xs font-semibold">
                Select Shade
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              className="btn-primary h-9 px-4 text-xs font-semibold"
              type="button"
              disabled={!canAddToCart}
              onClick={() => {
                if (!product.inStock) return;
                if (!isAuthenticated) {
                  toast({ title: "Please login to add items", variant: "destructive" });
                  setLocation("/auth/login");
                  return;
                }
                add(product, 1);
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
          )}
        </div>

        {/* Product badges */}
        <div className="flex gap-2 mt-3">
          {product.bestseller && (
            <Badge variant="secondary" className="text-xs">
              Bestseller
            </Badge>
          )}
          {product.newLaunch && (
            <Badge variant="secondary" className="text-xs">
              New Launch
            </Badge>
          )}
          {product.featured && (
            <Badge variant="secondary" className="text-xs">
              Featured
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
