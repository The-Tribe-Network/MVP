import { Dialog, DialogContent } from "../ui/dialog";

interface PhotoMediaDialogProps extends React.ComponentProps<typeof Dialog> {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
};

export default function PhotoMediaDialog({ isOpen, onOpenChange, imageUrl, ...props }: PhotoMediaDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} {...props} >
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