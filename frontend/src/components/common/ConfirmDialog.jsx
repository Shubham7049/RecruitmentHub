import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  isDestructive = true,
  isLoading = false,
}) => {
  const displayMessage =
    description || message || "This action cannot be undone. Please confirm to proceed.";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      title={null}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4 pt-2">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            isDestructive
              ? "bg-rose-100 text-rose-600"
              : "bg-amber-100 text-amber-600"
          }`}
        >
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900 mb-1.5">
            {title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">{displayMessage}</p>
        </div>
      </div>
    </Modal>
  );
};
