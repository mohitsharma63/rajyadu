import { Link } from "wouter";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWishlist } from "@/hooks/use-wishlist";
import { oliAssetUrl } from "@/lib/oliApi";

export default function Wishlist() {
  const { items, count, remove, clear } = useWishlist();

  if (count === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="py-16 text-center">
            <Heart className="mx-auto mb-6 h-24 w-24 text-gray-300" />
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Your wishlist is empty</h2>
            <p className="mb-8 text-gray-600">Save items you love so you can come back anytime.</p>
            <Link href="/">
              <Button className="btn-primary">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wishlist</h1>
            <p className="mt-2 text-gray-600">{count} item{count !== 1 ? "s" : ""} saved</p>
          </div>

          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
            <Button variant="destructive" onClick={clear}>
              Clear All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <Link href={`/product/${p.slug}`}>
                    <img
                      src={oliAssetUrl(p.imageUrl) ?? p.imageUrl}
                      alt={p.name}
                      className="h-56 w-full cursor-pointer "
                    />
                  </Link>

                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/90 text-black shadow-sm hover:bg-white dark:bg-black/60 dark:text-white dark:hover:bg-black/70"
                    aria-label="Remove from wishlist"
                    onClick={() => remove(p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 p-4">
                  <Link href={`/product/${p.slug}`}>
                    <h3 className="line-clamp-2 cursor-pointer text-base font-semibold text-gray-900 hover:text-red-500">
                      {p.name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">₹{p.price}</span>
                      {p.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">₹{p.originalPrice}</span>
                      )}
                    </div>

                    <Link href={`/product/${p.slug}`}>
                      <Button size="sm" className="btn-primary h-9 px-4 text-xs font-semibold">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
