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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800/60">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {description}
            </p>
            {detailNote && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {detailNote}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
