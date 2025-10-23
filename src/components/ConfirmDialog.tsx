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
            className="rounded-xl border border-tea-green-700 bg-white px-4 py-2 text-sm font-semibold text-oxford-blue-500 transition-colors hover:border-red-crayola-400 hover:text-red-crayola-500"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-gradient-to-r from-red-crayola-500 via-naples-yellow-400 to-tea-green-400 px-4 py-2 text-sm font-semibold text-oxford-blue-500 shadow-md shadow-charcoal-900/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-red-crayola-200"
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
