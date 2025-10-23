"use client";
import Modal from "./Modal";
import { ReactNode } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  message: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmDialogProps) => {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      actions={
        <>
          <button
            onClick={onCancel}
            className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-400 transition-colors hover:border-rose-300 hover:text-rose-500"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 px-4 py-2 text-sm font-semibold text-rose-900 shadow-md shadow-rose-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-rose-200"
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
};

export default ConfirmDialog;
