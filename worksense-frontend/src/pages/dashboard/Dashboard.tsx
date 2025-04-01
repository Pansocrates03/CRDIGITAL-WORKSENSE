import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span>Bienvenido, {user?.username}</span>
          <Button onClick={logout} variant="outline">
            Cerrar sesión
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Aquí puedes agregar el contenido de tu dashboard */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Panel de Control</h2>
          <p>Contenido del panel...</p>
        </div>
      </div>
    </div>
  );
}
