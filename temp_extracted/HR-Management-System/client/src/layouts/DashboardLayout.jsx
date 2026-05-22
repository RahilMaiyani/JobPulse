import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ children, onAddUser }) {
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} />

      <div className="flex-1 bg-gray-100 flex flex-col overflow-hidden">
        
        <Header onAddUser={onAddUser} />

        <div className="flex-1 overflow-auto p-4">
          {children}
        </div>

      </div>
    </div>
  );
}