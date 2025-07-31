"use client";

import { createPortal } from "react-dom";
import React from "react";

type CuteConfirmProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const CuteConfirm = ({ message, onConfirm, onCancel }: CuteConfirmProps) => {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="glass-card text-center space-y-4">
        <p className="text-white text-lg">{message}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg text-sm font-medium"
          >
            Yes, delete
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded-lg text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CuteConfirm;
