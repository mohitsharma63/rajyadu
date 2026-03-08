import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { oliAssetUrl, oliGetJson, oliRequest, oliUrl } from "@/lib/oliApi";
import type { Category, Product, SubCategory } from "@/lib/types";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

type ProductFormState = {
  name: string;
  slug: string;
  price: string;
  originalPrice: string;
  category: string;
  subcategory: string;
  imageUrl: string;
  shortDescription: string;
  description: string;
  rating: string;
  reviewCount: string;
  saleOffer: string;
  size: string;
  tags: string;
  inStock: boolean;
  featured: boolean;
  bestseller: boolean;
  newLaunch: boolean;
};

const emptyForm: ProductFormState = {
  name: "",
  slug: "",
  price: "",
  originalPrice: "",
  category: "",
  subcategory: "",
  imageUrl: "",
  shortDescription: "",
  description: "",
  rating: "4.5",
  reviewCount: "0",
  saleOffer: "",
  size: "",
  tags: "",
  inStock: true,
  featured: false,
  bestseller: false,
  newLaunch: false,
};

function toTagsArray(tags: string): string[] | undefined {
  const parts = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return parts.length ? parts : undefined;
}

function resolveImageSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^data:/i.test(url)) return url;
  return oliAssetUrl(url) ?? url;
}

export default function AdminProducts() {
  const { toast } = useToast();

  const productsQueryKey = useMemo(() => [oliUrl("/api/products")], []);
  const categoriesQueryKey = useMemo(() => [oliUrl("/api/categories")], []);

  const { data: apiProducts = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: productsQueryKey,
    queryFn: () => oliGetJson<Product[]>("/api/products"),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: categoriesQueryKey,
    queryFn: () => oliGetJson<Category[]>("/api/categories"),
  });

  const [createForm, setCreateForm] = useState<ProductFormState>(emptyForm);
  const [createImage, setCreateImage] = useState<File | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [editing, setEditing] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<ProductFormState>(emptyForm);
  const [editImage, setEditImage] = useState<File | null>(null);

  const rows = useMemo(() => {
    return [...apiProducts];
  }, [apiProducts]);

  const categoryOptions = useMemo(() => {
    return categories.map((c) => ({ slug: c.slug, name: c.name }));
  }, [categories]);

  const categoryNameById = useMemo(() => {
    return new Map<number, string>(categories.map((c) => [c.id, c.name]));
  }, [categories]);

  const selectedCreateCategoryId = useMemo(() => {
    if (!createForm.category) return undefined;
    return categories.find((c) => c.slug === createForm.category)?.id;
  }, [categories, createForm.category]);

  const { data: createSubcategories = [] } = useQuery<SubCategory[]>({
    queryKey: [
      oliUrl(`/api/subcategories?categoryId=${selectedCreateCategoryId ?? ""}`),
    ],
    enabled: !!selectedCreateCategoryId,
    queryFn: () =>
      oliGetJson<SubCategory[]>(`/api/subcategories?categoryId=${selectedCreateCategoryId}`),
  });

  const selectedCreateSubCategoryId = useMemo(() => {
    if (!createForm.subcategory) return undefined;
    return createSubcategories.find((sc) => sc.slug === createForm.subcategory)?.id;
  }, [createForm.subcategory, createSubcategories]);

  const selectedEditCategoryId = useMemo(() => {
    if (!editing?.id) return undefined;
    if (!editForm.category) return undefined;
    return categories.find((c) => c.slug === editForm.category)?.id;
  }, [categories, editing?.id, editForm.category]);

  const { data: editSubcategories = [] } = useQuery<SubCategory[]>({
    queryKey: [oliUrl(`/api/subcategories?categoryId=${selectedEditCategoryId ?? ""}`)],
    enabled: !!selectedEditCategoryId && !!editing,
    queryFn: () =>
      oliGetJson<SubCategory[]>(`/api/subcategories?categoryId=${selectedEditCategoryId}`),
  });

  const selectedEditSubCategoryId = useMemo(() => {
    if (!editForm.subcategory) return undefined;
    return editSubcategories.find((sc) => sc.slug === editForm.subcategory)?.id;
  }, [editForm.subcategory, editSubcategories]);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCreateCategoryId) throw new Error("Please select a category");
      if (!createImage) throw new Error("Please upload an image");

      const fd = new FormData();
      fd.append("categoryId", String(selectedCreateCategoryId));
      if (selectedCreateSubCategoryId) {
        fd.append("subCategoryId", String(selectedCreateSubCategoryId));
      }
      fd.append("name", createForm.name.trim());
      fd.append("slug", createForm.slug.trim());
      fd.append("shortDescription", createForm.shortDescription.trim());
      fd.append("description", createForm.description.trim());
      fd.append("price", createForm.price.trim());
      if (createForm.originalPrice.trim()) fd.append("originalPrice", createForm.originalPrice.trim());
      if (createForm.rating.trim()) fd.append("rating", createForm.rating.trim());
      if (createForm.reviewCount.trim()) fd.append("reviewCount", createForm.reviewCount.trim());
      if (createForm.size.trim()) fd.append("size", createForm.size.trim());
      if (createForm.saleOffer.trim()) fd.append("saleOffer", createForm.saleOffer.trim());
      if (createForm.tags.trim()) fd.append("tags", createForm.tags.trim());
      fd.append("inStock", String(createForm.inStock));
      fd.append("featured", String(createForm.featured));
      fd.append("bestseller", String(createForm.bestseller));
      fd.append("newLaunch", String(createForm.newLaunch));
      fd.append("image", createImage);
      const res = await oliRequest("POST", "/api/products", fd);
      return (await res.json()) as Product;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productsQueryKey });
      setCreateForm(emptyForm);
      setCreateImage(null);
      setCreateOpen(false);
      toast({ title: "Product created" });
    },
    onError: (e) => {
      toast({
        title: "Failed to create product",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: number }) => {
      const fd = new FormData();

      if (selectedEditCategoryId) fd.append("categoryId", String(selectedEditCategoryId));
      if (selectedEditSubCategoryId) fd.append("subCategoryId", String(selectedEditSubCategoryId));
      if (editForm.name.trim()) fd.append("name", editForm.name.trim());
      if (editForm.slug.trim()) fd.append("slug", editForm.slug.trim());
      if (editForm.shortDescription.trim()) fd.append("shortDescription", editForm.shortDescription.trim());
      if (editForm.description.trim()) fd.append("description", editForm.description.trim());
      if (editForm.price.trim()) fd.append("price", editForm.price.trim());
      if (editForm.originalPrice.trim()) fd.append("originalPrice", editForm.originalPrice.trim());
      if (editForm.rating.trim()) fd.append("rating", editForm.rating.trim());
      if (editForm.reviewCount.trim()) fd.append("reviewCount", editForm.reviewCount.trim());
      if (editForm.size.trim()) fd.append("size", editForm.size.trim());
      if (editForm.saleOffer.trim()) fd.append("saleOffer", editForm.saleOffer.trim());
      if (editForm.tags.trim()) fd.append("tags", editForm.tags.trim());
      fd.append("inStock", String(editForm.inStock));
      fd.append("featured", String(editForm.featured));
      fd.append("bestseller", String(editForm.bestseller));
      fd.append("newLaunch", String(editForm.newLaunch));
      if (editImage) fd.append("image", editImage);

      const res = await oliRequest("PUT", `/api/products/${payload.id}`, fd);
      return (await res.json()) as Product;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productsQueryKey });
      setEditing(null);
      setEditImage(null);
      toast({ title: "Product updated" });
    },
    onError: (e) => {
      toast({
        title: "Failed to update product",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await oliRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: productsQueryKey });
      toast({ title: "Product deleted" });
    },
    onError: (e) => {
      toast({
        title: "Failed to delete product",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    },
  });

  const canCreate =
    createForm.name.trim().length > 0 &&
    createForm.slug.trim().length > 0 &&
    createForm.price.trim().length > 0 &&
    createForm.category.trim().length > 0 &&
    !!createImage &&
    createForm.shortDescription.trim().length > 0 &&
    createForm.description.trim().length > 0;

  const createFormIsDefault =
    createForm.name === emptyForm.name &&
    createForm.slug === emptyForm.slug &&
    createForm.price === emptyForm.price &&
    createForm.originalPrice === emptyForm.originalPrice &&
    createForm.category === emptyForm.category &&
    createForm.subcategory === emptyForm.subcategory &&
    createForm.imageUrl === emptyForm.imageUrl &&
    createForm.shortDescription === emptyForm.shortDescription &&
    createForm.description === emptyForm.description &&
    createForm.rating === emptyForm.rating &&
    createForm.reviewCount === emptyForm.reviewCount &&
    createForm.saleOffer === emptyForm.saleOffer &&
    createForm.size === emptyForm.size &&
    createForm.tags === emptyForm.tags &&
    createForm.inStock === emptyForm.inStock &&
    createForm.featured === emptyForm.featured &&
    createForm.bestseller === emptyForm.bestseller &&
    createForm.newLaunch === emptyForm.newLaunch &&
    createImage === null;

  const beginEdit = (p: Product) => {
    setEditing(p);
    setEditImage(null);

    const catSlug: string =
      (p.categoryId ? categories.find((c) => c.id === p.categoryId)?.slug : undefined) ??
      categories.find((c) => c.slug === p.category || c.name === p.category)?.slug ??
      (p.category ?? "");

    setEditForm({
      name: p.name,
      slug: p.slug,
      price: String(p.price ?? ""),
      originalPrice: p.originalPrice === undefined || p.originalPrice === null ? "" : String(p.originalPrice),
      category: catSlug,
      subcategory: p.subcategory ?? "",
      imageUrl: p.imageUrl,
      shortDescription: p.shortDescription,
      description: p.description,
      rating: String(p.rating ?? ""),
      reviewCount: String(p.reviewCount ?? 0),
      saleOffer: p.saleOffer ?? "",
      size: p.size ?? "",
      tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
      inStock: !!p.inStock,
      featured: !!p.featured,
      bestseller: !!p.bestseller,
      newLaunch: !!p.newLaunch,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage products.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Add product</Button>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create product</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="create-product-name">Name</Label>
                <Input
                  id="create-product-name"
                  placeholder="Product name"
                  value={createForm.name}
                  onChange={(e) => {
                    const nextName = e.target.value;
                    setCreateForm((prev) => {
                      const next: ProductFormState = { ...prev, name: nextName };
                      if (!prev.slug.trim()) next.slug = slugify(nextName);
                      return next;
                    });
                  }}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="create-product-slug">Slug</Label>
                <Input
                  id="create-product-slug"
                  placeholder="e.g. vitamin-c-face-serum"
                  value={createForm.slug}
                  onChange={(e) => setCreateForm((p) => ({ ...p, slug: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="create-product-price">Price</Label>
                  <Input
                    id="create-product-price"
                    placeholder="545"
                    value={createForm.price}
                    onChange={(e) => setCreateForm((p) => ({ ...p, price: e.target.value }))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="create-product-original-price">Original price (optional)</Label>
                  <Input
                    id="create-product-original-price"
                    placeholder="695"
                    value={createForm.originalPrice}
                    onChange={(e) =>
                      setCreateForm((p) => ({ ...p, originalPrice: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select
                    value={createForm.category}
                    onValueChange={(v) =>
                      setCreateForm((p) => ({ ...p, category: v, subcategory: "" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Subcategory (optional)</Label>
                  <Select
                    value={createForm.subcategory}
                    onValueChange={(v) => setCreateForm((p) => ({ ...p, subcategory: v }))}
                    disabled={!selectedCreateCategoryId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedCreateCategoryId ? "Select subcategory" : "Select category first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {createSubcategories.map((sc) => (
                        <SelectItem key={sc.id} value={sc.slug}>
                          {sc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="create-product-image">Image</Label>
                <Input
                  id="create-product-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (!file) return;

                    setCreateImage(file);

                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = typeof reader.result === "string" ? reader.result : "";
                      setCreateForm((p) => ({ ...p, imageUrl: result }));
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="create-product-short">Short description</Label>
                <Input
                  id="create-product-short"
                  placeholder="Glowing, Brighter Skin in 5 Days"
                  value={createForm.shortDescription}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, shortDescription: e.target.value }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="create-product-desc">Description</Label>
                <Textarea
                  id="create-product-desc"
                  placeholder="Full description..."
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="create-product-rating">Rating</Label>
                  <Input
                    id="create-product-rating"
                    placeholder="4.6"
                    value={createForm.rating}
                    onChange={(e) => setCreateForm((p) => ({ ...p, rating: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-product-reviewCount">Review count</Label>
                  <Input
                    id="create-product-reviewCount"
                    type="number"
                    placeholder="0"
                    value={createForm.reviewCount}
                    onChange={(e) =>
                      setCreateForm((p) => ({ ...p, reviewCount: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-product-size">Size (optional)</Label>
                  <Input
                    id="create-product-size"
                    placeholder="30ml"
                    value={createForm.size}
                    onChange={(e) => setCreateForm((p) => ({ ...p, size: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="create-product-saleOffer">Sale offer (optional)</Label>
                  <Input
                    id="create-product-saleOffer"
                    placeholder="B1G1FREE"
                    value={createForm.saleOffer}
                    onChange={(e) =>
                      setCreateForm((p) => ({ ...p, saleOffer: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-product-tags">Tags (comma-separated)</Label>
                  <Input
                    id="create-product-tags"
                    placeholder="hydrating, daily-use"
                    value={createForm.tags}
                    onChange={(e) => setCreateForm((p) => ({ ...p, tags: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={createForm.inStock}
                    onCheckedChange={(v) => setCreateForm((p) => ({ ...p, inStock: v }))}
                  />
                  <Label>In stock</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={createForm.featured}
                    onCheckedChange={(v) => setCreateForm((p) => ({ ...p, featured: v }))}
                  />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={createForm.bestseller}
                    onCheckedChange={(v) => setCreateForm((p) => ({ ...p, bestseller: v }))}
                  />
                  <Label>Bestseller</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={createForm.newLaunch}
                    onCheckedChange={(v) => setCreateForm((p) => ({ ...p, newLaunch: v }))}
                  />
                  <Label>New launch</Label>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {resolveImageSrc(createForm.imageUrl) ? (
                  <img
                    src={resolveImageSrc(createForm.imageUrl) ?? undefined}
                    alt={createForm.name || "Preview"}
                    className="h-12 w-12 rounded "
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-12 w-12 rounded bg-muted" />
                )}
                <div className="text-sm text-muted-foreground">
                  Upload an image to preview.
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateForm(emptyForm);
                setCreateImage(null);
              }}
              disabled={createFormIsDefault}
            >
              Reset
            </Button>
            <Button
              disabled={!canCreate || createMutation.isPending}
              onClick={() => {
                if (!canCreate) return;
                createMutation.mutate();
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>All products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground">
                      No products.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={`${row.id}-${row.slug}`}>
                      <TableCell>
                        {resolveImageSrc(row.imageUrl) ? (
                          <img
                            src={resolveImageSrc(row.imageUrl) ?? undefined}
                            alt={row.name}
                            className="h-10 w-10 rounded "
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {row.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.categoryId ? categoryNameById.get(row.categoryId) : row.category}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">₹{row.price}</div>
                        {row.originalPrice ? (
                          <div className="text-xs text-muted-foreground line-through">
                            ₹{row.originalPrice}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {row.bestseller ? (
                            <Badge variant="secondary">Bestseller</Badge>
                          ) : null}
                          {row.featured ? <Badge variant="secondary">Featured</Badge> : null}
                          {row.newLaunch ? (
                            <Badge variant="secondary">New</Badge>
                          ) : null}
                          {row.saleOffer ? (
                            <Badge variant="outline">{row.saleOffer}</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        {row.inStock ? (
                          <Badge variant="secondary">In stock</Badge>
                        ) : (
                          <Badge variant="outline">Out of stock</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => beginEdit(row)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={deleteMutation.isPending}
                          onClick={() => deleteMutation.mutate(row.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => {
                    const nextName = e.target.value;
                    setEditForm((prev) => {
                      const next: ProductFormState = { ...prev, name: nextName };
                      if (!prev.slug.trim()) next.slug = slugify(nextName);
                      return next;
                    });
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label>Slug</Label>
                <Input
                  value={editForm.slug}
                  onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Category</Label>
                {categoryOptions.length > 0 ? (
                  <Select
                    value={editForm.category}
                    onValueChange={(v) => setEditForm((p) => ({ ...p, category: v, subcategory: "" }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={editForm.category}
                    onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                  />
                )}
              </div>
              <div className="grid gap-2">
                <Label>Subcategory</Label>
                <Select
                  value={editForm.subcategory}
                  onValueChange={(v) => setEditForm((p) => ({ ...p, subcategory: v }))}
                  disabled={!selectedEditCategoryId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedEditCategoryId ? "Select subcategory" : "Select category first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {editSubcategories.map((sc) => (
                      <SelectItem key={sc.id} value={sc.slug}>
                        {sc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Price</Label>
                <Input
                  value={editForm.price}
                  onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Original price</Label>
                <Input
                  value={editForm.originalPrice}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, originalPrice: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-product-image">Image</Label>
              <Input
                id="edit-product-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (!file) return;

                  setEditImage(file);

                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = typeof reader.result === "string" ? reader.result : "";
                    setEditForm((p) => ({ ...p, imageUrl: result }));
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <div className="flex items-center gap-3">
                {resolveImageSrc(editForm.imageUrl) ? (
                  <img
                    src={resolveImageSrc(editForm.imageUrl) ?? undefined}
                    alt={editForm.name || "Preview"}
                    className="h-12 w-12 rounded "
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-12 w-12 rounded bg-muted" />
                )}
                <div className="text-sm text-muted-foreground">Upload an image to update.</div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Short description</Label>
              <Input
                value={editForm.shortDescription}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, shortDescription: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.inStock}
                  onCheckedChange={(v) => setEditForm((p) => ({ ...p, inStock: v }))}
                />
                <Label>In stock</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.featured}
                  onCheckedChange={(v) => setEditForm((p) => ({ ...p, featured: v }))}
                />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.bestseller}
                  onCheckedChange={(v) => setEditForm((p) => ({ ...p, bestseller: v }))}
                />
                <Label>Bestseller</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.newLaunch}
                  onCheckedChange={(v) => setEditForm((p) => ({ ...p, newLaunch: v }))}
                />
                <Label>New launch</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editing) return;
                const n = editForm.name.trim();
                const s = editForm.slug.trim();
                const c = editForm.category.trim();
                const p = editForm.price.trim();
                const img = editForm.imageUrl.trim();
                const sd = editForm.shortDescription.trim();
                const d = editForm.description.trim();
                if (!n || !s || !c || !p || !img || !sd || !d) return;

                updateMutation.mutate({ id: editing.id });
              }}
              disabled={updateMutation.isPending ||
                editForm.name.trim().length === 0 ||
                editForm.slug.trim().length === 0 ||
                editForm.category.trim().length === 0 ||
                editForm.price.trim().length === 0 ||
                editForm.imageUrl.trim().length === 0 ||
                editForm.shortDescription.trim().length === 0 ||
                editForm.description.trim().length === 0}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
