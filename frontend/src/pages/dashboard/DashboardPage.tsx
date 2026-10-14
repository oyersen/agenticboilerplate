import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Server, ShieldCheck, Database, RefreshCw, Zap } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../auth/KeycloakContext';
import { useLiveSync } from '../../core/socket/useLiveSync';

interface HealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // 1. TanStack Query ile anayasaya (AGENTS.md 2.D) uygun Server State Yönetimi
  const {
    data: health,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await api.get<HealthResponse>('/health');
      return response.data;
    },
    refetchInterval: 30000, // 30 saniyede bir otomatik polling
  });

  // 2. Canlı soket üzerinden sağlık/sistem sinyali gelirse otomatik tazeleyen hook
  useLiveSync('health', () => {
    refetch();
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-slate-900 rounded-2xl p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              Hoş Geldiniz, {user?.firstName || user?.username || 'Geliştirici'}!
            </h1>
            <p className="text-teal-100 text-sm mt-1 max-w-xl">
              Enterprise Agentic mimarisi başarıyla ayağa kalktı. Yapay zekâ ajanı yeni modülleri bu iskelet üzerine inşa etmeye hazır.
            </p>
          </div>
          <div>
            <Badge variant="success" size="md">
              Sistem Aktif
            </Badge>
          </div>
        </div>
      </div>

      {/* Metrics & Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">NestJS API Durumu</p>
              <h3 className="text-lg font-bold text-slate-800 mt-0.5">
                {isLoading ? 'Kontrol ediliyor...' : isError ? 'Bağlantı Hatası' : 'Çalışıyor'}
              </h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Keycloak SSO / OIDC</p>
              <h3 className="text-lg font-bold text-slate-800 mt-0.5">Bağlı & Doğrulandı</h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Veritabanı</p>
              <h3 className="text-lg font-bold text-slate-800 mt-0.5">PostgreSQL 16</h3>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Kuyruk & Önbellek</p>
              <h3 className="text-lg font-bold text-slate-800 mt-0.5">Redis 7 + BullMQ</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Health Check Details Card */}
      <Card
        title="Uçtan Uca Sağlık Kontrolü (End-to-End Health Check)"
        subtitle="Frontend -> Nginx -> NestJS -> PostgreSQL zinciri"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        }
      >
        {isError ? (
          <div className="p-4 rounded-lg bg-rose-50 text-rose-700 text-sm">
            Backend API ile bağlantı kurulamadı veya servis yanıt vermiyor.
          </div>
        ) : health ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-sm text-slate-600">Servis Durumu</span>
              <Badge variant="success">{health.status.toUpperCase()}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-sm text-slate-600">Sunucu Zamanı</span>
              <span className="text-sm font-mono text-slate-800">{health.timestamp}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-sm text-slate-600">Uptime</span>
              <span className="text-sm font-mono text-slate-800">{Math.round(health.uptime)} saniye</span>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
};
