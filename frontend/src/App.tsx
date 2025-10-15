import { useEffect, Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import { useAuthStore } from "./features/auth/stores/authStore";
import { ToastContainer } from "@/shared/components/ui/toast";

// Loading component para Suspense
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-bg">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-text-secondary">Cargando...</p>
      </div>
    </div>
  );
}

// Componente raiz de la aplicacion
// Carga el usuario al inicio y configura el router
function App() {
  const loadUserFromStorage = useAuthStore(
    (state) => state.loadUserFromStorage
  );
  const status = useAuthStore((state) => state.status);

  // Cargar usuario desde storage al montar la app
  useEffect(() => {
    if (status === "idle") {
      loadUserFromStorage();
    }
  }, [status, loadUserFromStorage]);

  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <RouterProvider router={router} />
      </Suspense>
      <ToastContainer />
    </>
  );
}

export default App;
