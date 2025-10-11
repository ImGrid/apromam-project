import toast, { Toaster } from "react-hot-toast";
import { CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";

export function ToastContainer() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#fff",
          color: "#2d3748",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          maxWidth: "500px",
        },
        success: {
          iconTheme: {
            primary: "#48bb78",
            secondary: "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#f56565",
            secondary: "#fff",
          },
        },
      }}
    />
  );
}

/**
 * Helpers para mostrar toasts con estilos APROMAM
 */
export const showToast = {
  success: (message: string) => {
    toast.custom(
      (t) => (
        <div
          className={`
            flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg border border-success/20
            ${
              t.visible
                ? "animate-in slide-in-from-top-4"
                : "animate-out slide-out-to-top-4"
            }
          `}
        >
          <CheckCircle className="flex-shrink-0 w-5 h-5 text-success" />
          <p className="text-sm font-medium text-text-primary">{message}</p>
        </div>
      ),
      { duration: 3000 }
    );
  },

  error: (message: string) => {
    toast.custom(
      (t) => (
        <div
          className={`
            flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg border border-error/20
            ${
              t.visible
                ? "animate-in slide-in-from-top-4"
                : "animate-out slide-out-to-top-4"
            }
          `}
        >
          <XCircle className="flex-shrink-0 w-5 h-5 text-error" />
          <p className="text-sm font-medium text-text-primary">{message}</p>
        </div>
      ),
      { duration: 5000 }
    );
  },

  info: (message: string) => {
    toast.custom(
      (t) => (
        <div
          className={`
            flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg border border-info/20
            ${
              t.visible
                ? "animate-in slide-in-from-top-4"
                : "animate-out slide-out-to-top-4"
            }
          `}
        >
          <Info className="flex-shrink-0 w-5 h-5 text-info" />
          <p className="text-sm font-medium text-text-primary">{message}</p>
        </div>
      ),
      { duration: 4000 }
    );
  },

  warning: (message: string) => {
    toast.custom(
      (t) => (
        <div
          className={`
            flex items-center gap-3 px-4 py-3 bg-white rounded-lg shadow-lg border border-warning/20
            ${
              t.visible
                ? "animate-in slide-in-from-top-4"
                : "animate-out slide-out-to-top-4"
            }
          `}
        >
          <AlertTriangle className="flex-shrink-0 w-5 h-5 text-warning" />
          <p className="text-sm font-medium text-text-primary">{message}</p>
        </div>
      ),
      { duration: 4000 }
    );
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: "#fff",
        color: "#2d3748",
      },
    });
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },
};
