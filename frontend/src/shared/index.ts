// Permisos
export * from "./config/permissions.config";
export * from "./utils/roleHelpers";
export * from "./hooks/usePermissions";
export { PermissionGate } from "./components/layout/PermissionGate";

// Hooks
export { useAuth } from "./hooks/useAuth";
export { useClickOutside } from "./hooks/useClickOutside";

// Componentes UI
export { Button } from "./components/ui/Button";
export { Input } from "./components/ui/Input";

// Layouts
export { AuthLayout } from "./components/layout/AuthLayout";
export { AdminLayout } from "./components/layout/AdminLayout";
export { Header } from "./components/layout/Header";
export { Sidebar } from "./components/layout/Sidebar";
export { UserMenu } from "./components/layout/UserMenu";
export { ProtectedRoute } from "./components/layout/ProtectedRoute";

// Config
export { ROUTES } from "./config/routes.config";

// API
export { apiClient, ENDPOINTS } from "./services/api";
