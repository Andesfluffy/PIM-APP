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
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded-lg text-sm"
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
