import { Dialog, DialogContent } from "../ui/dialog";

interface PhotoMediaDialogProps {
  imageUrl: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PhotoMediaDialog({ imageUrl, isOpen, onOpenChange }: PhotoMediaDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] max-h-[95vh] w-[95vw] sm:w-[90vw] lg:w-auto h-auto p-4 flex items-center justify-center"
        showCloseButton={true}
      >
        <img
          src={imageUrl}
          alt="Post image preview"
          className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg"
        />
      </DialogContent>
    </Dialog>
  )
}