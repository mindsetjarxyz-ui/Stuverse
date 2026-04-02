import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export function GlobalDialogs() {
  const { alertDialog, confirmDialog, closeAlert, closeConfirm } = useAppStore();

  return (
    <AnimatePresence>
      {alertDialog?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-bg-secondary border border-border-glass rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
          >
            <button
              onClick={closeAlert}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold text-white mb-4">Notice</h3>
            <p className="text-gray-300 mb-6">{alertDialog.message}</p>
            <div className="flex justify-end">
              <button
                onClick={closeAlert}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-medium"
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {confirmDialog?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-bg-secondary border border-border-glass rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
          >
            <button
              onClick={closeConfirm}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold text-white mb-4">Confirm</h3>
            <p className="text-gray-300 mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirm}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  closeConfirm();
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/20"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
