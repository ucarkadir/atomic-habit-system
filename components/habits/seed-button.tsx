"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function SeedButton() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="outline"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        const response = await fetch("/api/seed", { method: "POST" });
        const result = await response.json();
        setLoading(false);

        if (!response.ok) {
          toast.error(result.error ?? "Seed basarisiz");
          return;
        }

        toast.success(result.skipped ? "Seed atlandi, mevcut habitler korunuyor." : "Seed tamamlandi.");
        window.location.reload();
      }}
    >
      {loading ? "Calisiyor..." : "Seed habits"}
    </Button>
  );
}
