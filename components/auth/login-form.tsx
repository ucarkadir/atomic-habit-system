"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const result = await Promise.race([
        supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error("İstek zaman aşımına uğradı. Supabase Auth ayarlarını kontrol et."));
          }, 15000);
        })
      ]);

      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Magic link gönderildi.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Giriş isteği başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Giriş</CardTitle>
        <CardDescription>
          Supabase Auth ile e-posta bağlantısı kullanılır. Ücretsiz planda ek SMTP gerekmez.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="ornek@mail.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Magic Link Gönder"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
