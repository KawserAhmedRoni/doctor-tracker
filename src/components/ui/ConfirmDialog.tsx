import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  detailNote?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  detailNote,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  loading = false,
}) => {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900/60 shadow-xs">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1 pt-0.5">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
              {description}
            </p>
            {detailNote && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {detailNote}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading} className="rounded-xl">
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            loading={loading}
            className="rounded-xl shadow-xs"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
