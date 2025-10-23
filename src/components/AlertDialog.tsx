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
          className="rounded-xl bg-gradient-to-r from-red-crayola-500 via-naples-yellow-400 to-tea-green-400 px-4 py-2 text-sm font-semibold text-oxford-blue-500 shadow-md shadow-charcoal-900/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-crayola-200"
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
