"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@school-portal/ui";
import { Search, Plus, X } from "@school-portal/ui";
import { InvoiceCategoryManager } from "@/components/invoice-category-manager";

interface InvoiceFormProps {
  students: { id: string; firstName: string; lastName: string }[];
  initialCategories?: { id: string; name: string; isActive: boolean; sortOrder: number }[];
}

interface LineItem {
  category: string;
  description: string;
  amount: string;
}

const DEFAULT_CATEGORIES = [
  "Tuition", "Miscellaneous Fees", "Books & Materials", "Uniform",
  "Activities & Events", "Field Trip", "Transportation", "Meals",
  "Insurance", "Technology Fee", "Laboratory Fee", "Other",
];

export function InvoiceForm({ students, initialCategories }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; firstName: string; lastName: string } | null>(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<typeof students>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([{ category: "", description: "", amount: "" }]);
  const [categories, setCategories] = useState(initialCategories ?? []);
  const categoryNames = categories.length > 0 ? categories.map((c) => c.name) : DEFAULT_CATEGORIES;
  const [formData, setFormData] = useState({
    description: "",
    dueDate: "",
  });

  const filterStudents = useCallback((q: string) => {
    if (!q) return [];
    const lower = q.toLowerCase();
    return students.filter(
      (s) => s.firstName.toLowerCase().includes(lower) || s.lastName.toLowerCase().includes(lower)
    ).slice(0, 10);
  }, [students]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const results = filterStudents(search);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 150);
    return () => clearTimeout(timer);
  }, [search, filterStudents]);

  function selectStudent(student: typeof students[0]) {
    setSelectedStudent(student);
    setSearch("");
    setShowSuggestions(false);
  }

  function addLineItem() {
    setLineItems([...lineItems, { category: "", description: "", amount: "" }]);
  }

  function updateLineItem(index: number, field: keyof LineItem, value: string) {
    const updated = [...lineItems];
    updated[index][field] = value;
    // Auto-fill description from category
    if (field === "category" && !updated[index].description) {
      updated[index].description = value;
    }
    setLineItems(updated);
  }

  function removeLineItem(index: number) {
    setLineItems(lineItems.filter((_, i) => i !== index));
  }

  const totalAmount = lineItems.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (!selectedStudent) {
      // silently fail - user can retry
      setLoading(false);
      return;
    }

    const validItems = lineItems
      .filter((item) => item.amount)
      .map((item) => ({
        description: item.description || item.category || "Charge",
        amount: parseFloat(item.amount),
      }));

    if (validItems.length === 0) {
      // silently fail - user can retry
      setLoading(false);
      return;
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 1000)
    ).padStart(3, "0")}`;

    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: invoiceNumber,
        description: formData.description,
        studentId: selectedStudent.id,
        dueDate: formData.dueDate,
        totalAmount,
        lineItems: validItems,
      }),
    });

    if (res.ok) {
      setSelectedStudent(null);
      setFormData({ description: "", dueDate: "" });
      setLineItems([{ category: "", description: "", amount: "" }]);
      router.refresh();
    } else {
      // silently fail - user can retry
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[24px] border border-[#e6e6e6] bg-white p-6">
      <h3 className="text-headline text-black">Create Invoice</h3>

      {/* Student autocomplete */}
      <div className="space-y-2">
        <Label>Student</Label>
        {selectedStudent ? (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#f1f1f1] px-3 py-1 text-body-sm font-[480] text-black">
              {selectedStudent.firstName} {selectedStudent.lastName}
            </span>
            <button type="button" onClick={() => setSelectedStudent(null)} className="text-black/40 hover:text-[#ff3d8b]">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
            <Input
              placeholder="Search student by name..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => search && suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              required={!selectedStudent}
            />
            {showSuggestions && (
              <div className="absolute z-10 mt-1 w-full rounded-[8px] border border-[#e6e6e6] bg-white">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="block w-full px-4 py-2 text-left text-body-sm hover:bg-[#fafaf9]"
                    onMouseDown={() => selectStudent(s)}
                  >
                    <span className="font-medium">{s.firstName} {s.lastName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Invoice Description</Label>
          <Input
            id="description"
            placeholder="e.g. Monthly Tuition - July 2026"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Category manager */}
      <InvoiceCategoryManager categories={categories} onCategoriesChange={setCategories} />

      {/* Line items with categories */}
      <div className="space-y-2">
        <Label>Line Items</Label>
        {lineItems.map((item, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
              {index === 0 && <span className="text-caption text-black/50">Category</span>}
              <select
                className="flex h-10 w-full rounded-[8px] border border-[#e6e6e6] bg-white px-3 py-2 text-body-sm"
                value={item.category}
                onChange={(e) => updateLineItem(index, "category", e.target.value)}
              >
                <option value="">Select category</option>
                {categoryNames.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-1">
              {index === 0 && <span className="text-caption text-black/50">Description</span>}
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateLineItem(index, "description", e.target.value)}
                required
              />
            </div>
            <div className="w-32 space-y-1">
              {index === 0 && <span className="text-caption text-black/50">Amount</span>}
              <Input
                placeholder="Amount"
                type="number"
                min="0"
                step="0.01"
                value={item.amount}
                onChange={(e) => updateLineItem(index, "amount", e.target.value)}
                required
              />
            </div>
            {lineItems.length > 1 && (
              <button type="button" onClick={() => removeLineItem(index)} className="mb-1 text-black/40 hover:text-[#ff3d8b]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addLineItem}>
          <Plus className="mr-1 h-3 w-3" />
          Add Line Item
        </Button>
      </div>

      <div className="flex items-center justify-between border-t border-[#f1f1f1] pt-4">
        <span className="text-headline tabular-nums">Total: ₱{totalAmount.toLocaleString()}</span>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}
