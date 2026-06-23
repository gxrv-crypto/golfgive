"use client";
import * as React from "react";
import { toast } from "sonner";
import { Loader2, Upload, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadProofAction } from "@/lib/actions/winner-actions";

/**
 * Optional proof screenshot upload for a win. The file is sent to a server
 * action which stores it in Supabase Storage (private `winner-proofs` bucket).
 */
export function ProofUpload({
  winnerId,
  hasProof,
}: {
  winnerId: string;
  hasProof: boolean;
}) {
  const [pending, start] = React.useTransition();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  function submit() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      toast.error("Choose a file first");
      return;
    }
    const fd = new FormData();
    fd.set("winnerId", winnerId);
    fd.set("file", file);
    start(async () => {
      const res = await uploadProofAction(fd);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Proof uploaded");
      setFileName(null);
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {hasProof && (
        <span className="flex items-center gap-1.5 text-xs font-medium text-success">
          <FileCheck2 className="size-3.5" /> Proof on file
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="size-3.5" /> {fileName ? "Change file" : hasProof ? "Replace proof" : "Add proof"}
      </Button>
      {fileName && (
        <>
          <span className="max-w-32 truncate text-xs text-muted-foreground">{fileName}</span>
          <Button size="sm" onClick={submit} disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />} Upload
          </Button>
        </>
      )}
    </div>
  );
}
