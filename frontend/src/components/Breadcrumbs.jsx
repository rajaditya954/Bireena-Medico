import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6 font-medium">
      <Link
        to="/dashboard"
        className="hover:text-emerald-600 transition-colors flex items-center"
      >
        <Home className="w-4 h-4 mr-1" />
        Dashboard
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const label = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");

        // Skip dashboard if it's the first element since we already have Home
        if (value === "dashboard") return null;

        return (
          <div key={to} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-gray-300" />
            {last ? (
              <span className="text-[#06402B] font-bold">{label}</span>
            ) : (
              <Link to={to} className="hover:text-emerald-600 transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
