import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "./ui/Button";

export default function Header({ onAddUser }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer); 
  }, []);

  // Formatters
  const timeString = time.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const dateString = time.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  // -------------------

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-10">
      
      {/* Clock Section */}
      <div className="flex items-center gap-3 border-l-4 border-indigo-600 pl-4 py-1">
        <div className="flex flex-col">
          <span className="text-xl font-bold tabular-nums text-gray-900 leading-none">
            {timeString}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
            {dateString}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user?.role === "admin" && (
          <Button 
            onClick={onAddUser} 
            className={isActive("/users") ? "" : "hidden"}
          >
            + Add User
          </Button>
        )}

        <Button
          variant="danger" className="mr-4"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}