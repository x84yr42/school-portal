"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Label } from "@school-portal/ui";
import { Plus, X } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codes, setCodes] = useState<string[]>([""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function addCode() {
    setCodes([...codes, ""]);
  }

  function removeCode(index: number) {
    if (codes.length <= 1) return;
    setCodes(codes.filter((_, i) => i !== index));
  }

  function updateCode(index: number, value: string) {
    const newCodes = [...codes];
    newCodes[index] = value.toUpperCase();
    setCodes(newCodes);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validCodes = codes.filter((c) => c.trim() !== "");
    if (validCodes.length === 0) {
      setError("Please enter at least one student code");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, codes: validCodes }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    if (signInResult?.error) {
      setError("Account created but sign-in failed. Please log in manually.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-50 px-4 pb-24">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-blue-600">Little Scholars</h1>
          <p className="mt-1 text-gray-600">Parent Registration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Juan Dela Cruz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="parent@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Student Link Codes</Label>
              <button
                type="button"
                onClick={addCode}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
              >
                <Plus className="h-3 w-3" />
                Add another child
              </button>
            </div>
            {codes.map((code, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="text"
                  placeholder={`e.g. MARIA2026`}
                  value={code}
                  onChange={(e) => updateCode(index, e.target.value)}
                  required={codes.length === 1}
                  className="flex-1"
                />
                {codes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCode(index)}
                    className="rounded-md border border-gray-200 px-2 text-gray-500 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <p className="text-xs text-gray-500">
              Enter the code(s) provided by the school to link your child(ren).
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
