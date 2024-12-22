import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

type ModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  header?: React.ReactNode;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
};

const Modal = ({
  open,
  setOpen,
  title,
  description,
  header,
  children,
  trigger,
  footer,
}: ModalProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          {header}
          {title && <DialogTitle>{title}</DialogTitle>}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter className="flex justify-between">{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
