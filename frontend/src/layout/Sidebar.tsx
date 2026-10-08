import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Settings, FolderTree } from 'lucide-react';
import { navigationItems } from './navigation';
import { useAuth } from '../auth/KeycloakContext';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-5 h-5 mr-3" />,
  Package: <Package className="w-5 h-5 mr-3" />,
  Users: <Users className="w-5 h-5 mr-3" />,
  Settings: <Settings className="w-5 h-5 mr-3" />,
  FolderTree: <FolderTree className="w-5 h-5 mr-3" />,
};

export const Sidebar: React.FC = () => {
  const { hasAnyRole } = useAuth();

  const filteredItems = navigationItems.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return hasAnyRole(item.roles);
  });

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 bg-slate-950/60 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-white text-base shadow-sm">
            E
          </div>
          <span className="font-semibold text-white tracking-wide text-sm">Enterprise Core</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Modüller
        </p>
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-teal-600/20 text-teal-400 font-semibold border-l-4 border-teal-500 pl-2'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            {iconMap[item.iconName] || <FolderTree className="w-5 h-5 mr-3" />}
            {item.title}
          </NavLink>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 text-center">
        v1.0.0 • Enterprise Agentic Core
      </div>
    </aside>
  );
};
