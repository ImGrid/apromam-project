/**
 * App Component
 * Componente raíz de la aplicación
 * Integra React Router con configuración de rutas
 */

import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";

function App() {
  return <RouterProvider router={router} />;
}

export default App;
