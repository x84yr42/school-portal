"use client";

import { useState, useEffect } from "react";
import { Button, Input, Label } from "@school-portal/ui";
import { Plus, Pencil, X, Check, FolderOpen } from "lucide-react";

interface Category {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

export function InvoiceCategoryManager({
  categories,
  onCategoriesChange,
}: {
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!newName.trim()) return;
    setLoading(true);
    const res = await fetch("/api/invoice-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      const cat = await res.json();
      onCategoriesChange([...categories, cat]);
      setNewName("");
    } else {
      const data = await res.json();
      // silently fail - user can retry
    }
    setLoading(false);
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    setLoading(true);
    const res = await fetch("/api/invoice-categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editName.trim() }),
    });
    if (res.ok) {
      const updated = await res.json();
      onCategoriesChange(categories.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
    } else {
      // silently fail - user can retry
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this category?")) return;
    setLoading(true);
    const res = await fetch(`/api/invoice-categories?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      onCategoriesChange(categories.filter((c) => c.id !== id));
    } else {
      // silently fail - user can retry
    }
    setLoading(false);
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 text-caption text-black hover:underline"
      >
        <FolderOpen className="h-3 w-3" />
        Manage Categories
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-[24px] border border-[#e6e6e6] bg-[#f7f7f5] p-4">
      <div className="flex items-center justify-between">
        <Label className="text-body-sm font-[700]">Manage Line Item Categories</Label>
        <button type="button" onClick={() => setIsOpen(false)} className="text-black/40 hover:text-black/60">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Existing categories */}
      <div className="space-y-1">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2">
            {editingId === cat.id ? (
              <>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleUpdate(cat.id)}
                  disabled={loading}
                  className="text-[#1ea64a] hover:text-[#178a3d]"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="text-black/40 hover:text-black/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <span className="flex-1 text-body-sm text-black/70">{cat.name}</span>
                <button
                  type="button"
                  onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                  className="text-black/40 hover:text-black"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id)}
                  className="text-black/40 hover:text-[#ff3d8b]"
                >
                  <X className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="flex gap-2">
        <Input
          placeholder="New category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
        />
        <Button type="button" onClick={handleAdd} disabled={loading || !newName.trim()}>
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </div>
    </div>
  );
}
