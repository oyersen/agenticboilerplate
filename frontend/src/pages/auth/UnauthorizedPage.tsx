import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 border border-rose-100 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Yetkisiz Erişim (403)</h1>
      <p className="text-slate-500 max-w-md mb-6 text-sm">
        Bu sayfayı görüntülemek için gerekli Keycloak rol yetkilerine sahip değilsiniz. Lütfen sistem yöneticinizle iletişime geçin.
      </p>
      <Button variant="outline" onClick={() => navigate('/')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Ana Sayfaya Dön
      </Button>
    </div>
  );
};
