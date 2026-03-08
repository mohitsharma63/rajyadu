import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Category } from "@/lib/types";
import { oliAssetUrl, oliGetJson, oliRequest, oliUrl } from "@/lib/oliApi";

export default function AdminCategories() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const { toast } = useToast();

  const categoriesQueryKey = useMemo(() => [oliUrl("/api/categories")], []);

  const { data: items = [], isLoading } = useQuery<Category[]>({
    queryKey: categoriesQueryKey,
    queryFn: () => oliGetJson<Category[]>("/api/categories"),
  });

  const canAdd = name.trim().length > 0 && slug.trim().length > 0;

  const rows = useMemo(() => items, [items]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("slug", slug.trim());
      if (image) fd.append("image", image);
      const res = await oliRequest("POST", "/api/categories", fd);
      return (await res.json()) as Category;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      setName("");
      setSlug("");
      setImage(null);
      toast({ title: "Category created" });
    },
    onError: (e) => {
      toast({
        title: "Failed to create category",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      id: number;
      name: string;
      slug: string;
      image: File | null;
    }) => {
      const fd = new FormData();
      fd.append("name", payload.name.trim());
      fd.append("slug", payload.slug.trim());
      if (payload.image) fd.append("image", payload.image);
      const res = await oliRequest("PUT", `/api/categories/${payload.id}`, fd);
      return (await res.json()) as Category;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      setEditing(null);
      toast({ title: "Category updated" });
    },
    onError: (e) => {
      toast({
        title: "Failed to update category",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await oliRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      toast({ title: "Category deleted" });
    },
    onError: (e) => {
      toast({
        title: "Failed to delete category",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage product categories.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Slug (e.g. skincare)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            />
            <Button
              disabled={!canAdd}
              onClick={() => {
                if (createMutation.isPending) return;
                if (!canAdd) return;
                createMutation.mutate();
              }}
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No categories.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {oliAssetUrl(row.imageUrl) ? (
                          <img
                            src={oliAssetUrl(row.imageUrl) ?? undefined}
                            alt={row.name}
                            className="h-10 w-10 rounded "
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.slug}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => {
                            setEditing(row);
                            setEditName(row.name);
                            setEditSlug(row.slug);
                            setEditImage(null);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            deleteMutation.mutate(row.id)
                          }
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
            <DialogTitle>Edit category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              placeholder="Category name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Input
              placeholder="Slug"
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value)}
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setEditImage(e.target.files?.[0] ?? null)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditing(null)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editing) return;
                const n = editName.trim();
                const s = editSlug.trim();
                if (!n || !s) return;
                updateMutation.mutate({
                  id: editing.id,
                  name: n,
                  slug: s,
                  image: editImage,
                });
              }}
              disabled={
                updateMutation.isPending ||
                editName.trim().length === 0 ||
                editSlug.trim().length === 0
              }
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
