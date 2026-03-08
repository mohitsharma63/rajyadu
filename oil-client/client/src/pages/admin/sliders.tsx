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
import type { Slider } from "@/lib/types";
import { oliAssetUrl, oliGetJson, oliRequest, oliUrl } from "@/lib/oliApi";

export default function AdminSliders() {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [editing, setEditing] = useState<Slider | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const { toast } = useToast();

  const slidersQueryKey = useMemo(() => [oliUrl("/api/sliders")], []);

  const { data: items = [], isLoading } = useQuery<Slider[]>({
    queryKey: slidersQueryKey,
    queryFn: () => oliGetJson<Slider[]>("/api/sliders"),
  });

  const canAdd = title.trim().length > 0;

  const createMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("title", title.trim());
      if (image) fd.append("image", image);
      const res = await oliRequest("POST", "/api/sliders", fd);
      return (await res.json()) as Slider;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: slidersQueryKey });
      setTitle("");
      setImage(null);
      toast({ title: "Slider created" });
    },
    onError: (e) => {
      toast({
        title: "Failed to create slider",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: number; title: string; image: File | null }) => {
      const fd = new FormData();
      fd.append("title", payload.title.trim());
      if (payload.image) fd.append("image", payload.image);
      const res = await oliRequest("PUT", `/api/sliders/${payload.id}`, fd);
      return (await res.json()) as Slider;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: slidersQueryKey });
      setEditing(null);
      toast({ title: "Slider updated" });
    },
    onError: (e) => {
      toast({
        title: "Failed to update slider",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await oliRequest("DELETE", `/api/sliders/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: slidersQueryKey });
      toast({ title: "Slider deleted" });
    },
    onError: (e) => {
      toast({
        title: "Failed to delete slider",
        description: e instanceof Error ? e.message : String(e),
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sliders</h1>
        <p className="text-sm text-muted-foreground">Create and manage homepage sliders.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add slider</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
          <CardTitle>All sliders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      No sliders.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {oliAssetUrl(row.imageUrl) ? (
                          <img
                            src={oliAssetUrl(row.imageUrl) ?? undefined}
                            alt={row.title}
                            className="h-10 w-16 rounded "
                          />
                        ) : (
                          <div className="h-10 w-16 rounded bg-muted" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          onClick={() => {
                            setEditing(row);
                            setEditTitle(row.title);
                            setEditImage(null);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
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
            <DialogTitle>Edit slider</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              placeholder="Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
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
                const t = editTitle.trim();
                if (!t) return;
                updateMutation.mutate({ id: editing.id, title: t, image: editImage });
              }}
              disabled={updateMutation.isPending || editTitle.trim().length === 0}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
