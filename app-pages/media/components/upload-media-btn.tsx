'use client'

import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useDialogStore } from "@/lib/stores/dialog-store";

interface UploadMediaBtnProps {
  tribeId: string;
}

export default function UploadMediaBtn({ tribeId }: UploadMediaBtnProps) {
  const openDialog = useDialogStore((s) => s.openDialog);

  const handleClick = () => {
    openDialog('media-upload', { tribeId });
  }

  return (
    <Button variant="outline" onClick={handleClick}>
      <Upload className="h-4 w-4 mr-2" />
      Upload Media
    </Button>
  )
}