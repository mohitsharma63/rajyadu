import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import type { Category, SubCategory } from "@/lib/types";
import { oliGetJson, oliRequest, oliUrl } from "@/lib/oliApi";

export default function AdminSubCategories() {
  const { toast } = useToast();

  const categoriesQueryKey = useMemo(() => [oliUrl("/api/categories")], []);
  const subcategoriesQueryKey = useMemo(() => [oliUrl("/api/subcategories")], []);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: categoriesQueryKey,
    queryFn: () => oliGetJson<Category[]>("/api/categories"),
  });

  const { data: items = [], isLoading: subcategoriesLoading } = useQuery<SubCategory[]>({
    queryKey: subcategoriesQueryKey,
    queryFn: () => oliGetJson<SubCategory[]>("/api/subcategories"),
  });

  const [parentId, setParentId] = useState<string>("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [editing, setEditing] = useState<SubCategory | null>(null);
  const [editParentId, setEditParentId] = useState<string>("");
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const canAdd =
    parentId.trim().length > 0 && name.trim().length > 0 && slug.trim().length > 0;

  const rows = useMemo(() => items, [items]);

  const parentName = (categoryId: number) =>
    categories.find((c) => c.id === categoryId)?.name ?? String(categoryId);

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await oliRequest("POST", "/api/subcategories", {
        categoryId: Number(parentId),
        name: name.trim(),
        slug: slug.trim(),
      });
      return (await res.json()) as SubCategory;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: subcategoriesQueryKey });
      setName("");
      setSlug("");
      toast({ title: "Sub category created" });
    },
    onError: (e) => {
      toast({
        title: "Failed to create sub category",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      id: number;
      categoryId: number;
      name: string;
      slug: string;
    }) => {
      const res = await oliRequest("PUT", `/api/subcategories/${payload.id}`, {
        categoryId: payload.categoryId,
        name: payload.name.trim(),
        slug: payload.slug.trim(),
      });
      return (await res.json()) as SubCategory;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: subcategoriesQueryKey });
      setEditing(null);
      toast({ title: "Sub category updated" });
    },
    onError: (e) => {
      toast({
        title: "Failed to update sub category",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await oliRequest("DELETE", `/api/subcategories/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: subcategoriesQueryKey });
      toast({ title: "Sub category deleted" });
    },
    onError: (e) => {
      toast({
        title: "Failed to delete sub category",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    },
  });

  const selectOptions = categories.map((c) => ({
    id: String(c.id),
    name: c.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sub Categories</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage sub categories under a parent category.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add sub category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Parent category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="__loading" disabled>
                    Loading...
                  </SelectItem>
                ) : (
                  selectOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Input
              placeholder="Sub category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Slug (e.g. serums)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <Button
              disabled={!canAdd}
              onClick={() => {
                const n = name.trim();
                const s = slug.trim();
                if (!parentId || !n || !s) return;
                if (createMutation.isPending) return;
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
          <CardTitle>All sub categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sub Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subcategoriesLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground">
                      No sub categories.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.slug}
                      </TableCell>
                      <TableCell>{parentName(row.categoryId)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => {
                            setEditing(row);
                            setEditParentId(String(row.categoryId));
                            setEditName(row.name);
                            setEditSlug(row.slug);
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
            <DialogTitle>Edit sub category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Select value={editParentId} onValueChange={setEditParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Parent category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesLoading ? (
                  <SelectItem value="__loading" disabled>
                    Loading...
                  </SelectItem>
                ) : (
                  selectOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Input
              placeholder="Sub category name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Input
              placeholder="Slug"
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value)}
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
                if (!n || !s || !editParentId) return;
                updateMutation.mutate({
                  id: editing.id,
                  categoryId: Number(editParentId),
                  name: n,
                  slug: s,
                });
              }}
              disabled={
                updateMutation.isPending ||
                editParentId.trim().length === 0 ||
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
