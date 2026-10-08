import React from 'react';
import { LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../auth/KeycloakContext';
import { Button } from '../components/ui/Button';

export const Header: React.FC = () => {
  const { user, roles, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title / Breadcrumb Placeholder */}
      <div className="flex items-center space-x-2 text-sm text-slate-500">
        <span className="font-medium text-slate-800">Yönetim Konsolu</span>
      </div>

      {/* User Actions */}
      <div className="flex items-center space-x-4">
        {/* Role badges */}
        <div className="hidden sm:flex items-center space-x-1.5">
          {roles.map((role) => (
            <span
              key={role}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
            >
              <Shield className="w-3 h-3 mr-1 text-slate-500" />
              {role}
            </span>
          ))}
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username || 'Kullanıcı'}
            </p>
            <p className="text-xs text-slate-500">{user?.email || ''}</p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          title="Çıkış Yap"
        >
          <LogOut className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">Çıkış</span>
        </Button>
      </div>
    </header>
  );
};
