import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/Loading/LoadingSpinner";

export default function create() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">create</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {user?.email}</span>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Here you can add your create content */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Control Panel</h2>
          <p>Panel content...</p>
        </div>
      </div>
    </div>
  );
}
