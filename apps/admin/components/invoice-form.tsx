"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label } from "@school-portal/ui";

interface InvoiceFormProps {
  students: { id: string; firstName: string; lastName: string }[];
}

export function InvoiceForm({ students }: InvoiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lineItems, setLineItems] = useState([{ description: "", amount: "" }]);
  const [formData, setFormData] = useState({
    studentId: "",
    description: "",
    dueDate: "",
  });

  function addLineItem() {
    setLineItems([...lineItems, { description: "", amount: "" }]);
  }

  function updateLineItem(index: number, field: "description" | "amount", value: string) {
    const updated = [...lineItems];
    updated[index][field] = value;
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

    const validItems = lineItems
      .filter((item) => item.description && item.amount)
      .map((item) => ({ description: item.description, amount: parseFloat(item.amount) }));

    if (validItems.length === 0) {
      alert("Please add at least one line item");
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
        studentId: formData.studentId,
        dueDate: formData.dueDate,
        totalAmount,
        lineItems: validItems,
      }),
    });

    if (res.ok) {
      setFormData({ studentId: "", description: "", dueDate: "" });
      setLineItems([{ description: "", amount: "" }]);
      router.refresh();
    } else {
      alert("Failed to create invoice");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900">Create Invoice</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="studentId">Student</Label>
          <select
            id="studentId"
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            required
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>
        </div>

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

      <div className="space-y-2">
        <Label>Line Items</Label>
        {lineItems.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Description"
              value={item.description}
              onChange={(e) => updateLineItem(index, "description", e.target.value)}
              className="flex-1"
              required
            />
            <Input
              placeholder="Amount"
              type="number"
              min="0"
              step="0.01"
              value={item.amount}
              onChange={(e) => updateLineItem(index, "amount", e.target.value)}
              className="w-32"
              required
            />
            {lineItems.length > 1 && (
              <Button type="button" variant="outline" onClick={() => removeLineItem(index)}>
                ×
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addLineItem}>
          + Add Line Item
        </Button>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="text-lg font-semibold">Total: ₱{totalAmount.toLocaleString()}</span>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}
