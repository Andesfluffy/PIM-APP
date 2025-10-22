"use client";
import Modal from "./Modal";

interface AlertDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  okText?: string;
}

const AlertDialog = ({ isOpen, title, message, onClose, okText = "OK" }: AlertDialogProps) => {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      actions={
        <button
          onClick={onClose}
          className="rounded-xl bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 px-4 py-2 text-sm font-semibold text-rose-900 shadow-md shadow-rose-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-rose-200"
        >
          {okText}
        </button>
      }
    >
      {message}
    </Modal>
  );
};

export default AlertDialog;
