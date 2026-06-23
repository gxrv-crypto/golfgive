"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { uploadAvatarAction } from "@/lib/actions/profile-actions";

export function ProfileCard({
  name,
  email,
  role,
  avatarUrl,
}: {
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const [preview, setPreview] = React.useState<string | null>(avatarUrl);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    const fd = new FormData();
    fd.set("file", file);
    start(async () => {
      const res = await uploadAvatarAction(fd);
      if (!res.ok) {
        toast.error(res.error);
        setPreview(avatarUrl);
        return;
      }
      if (res.data?.avatarUrl) setPreview(res.data.avatarUrl);
      toast.success("Profile picture updated");
      router.refresh();
    });
  }

  return (
    <Card className="w-full overflow-hidden p-0">
      {/* Animated gradient banner */}
      <div className="relative h-28 animate-gradient bg-gradient-to-r from-primary via-secondary to-accent sm:h-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
      </div>

      <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
        {/* Avatar with upload */}
        <div className="-mt-12 shrink-0">
          <div className="relative">
            <Avatar className="size-24 ring-4 ring-card shadow-md">
              {preview ? <AvatarImage src={preview} alt={name} /> : null}
              <AvatarFallback className="bg-primary/15 text-2xl font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={pending}
              aria-label="Change profile picture"
              className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-accent text-accent-foreground shadow ring-2 ring-card transition-transform hover:scale-105 disabled:opacity-60"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={onPick}
            />
          </div>
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1 sm:pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-bold">{name}</h2>
            <Badge variant={role === "admin" ? "default" : "secondary"}>{role}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{email}</p>
        </div>
      </div>
    </Card>
  );
}
