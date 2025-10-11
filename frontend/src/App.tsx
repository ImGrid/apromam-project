import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
import { useAuthStore } from "./features/auth/stores/authStore";
import { ToastContainer } from "@/shared/components/ui/toast";

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
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}

export default App;
