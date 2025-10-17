// components/MonitorDashboard.js
"use client";

import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Componente de Card de Métrica com design minimalista e moderno
const MetricCard = ({ title, value, unit = '', icon, trend, description }) => {
  return (
    <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-xl">
              {icon}
            </div>
          )}
        </div>
        
        {/* Value */}
        <div className="flex items-baseline space-x-2 mb-3">
          <span className="text-4xl font-bold text-white tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-lg font-medium text-gray-400">{unit}</span>
          )}
        </div>
        
        {/* Trend */}
        {trend && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
              trend.direction === 'up' 
                ? 'bg-green-500/10 text-green-400' 
                : trend.direction === 'down'
                ? 'bg-red-500/10 text-red-400'
                : 'bg-gray-500/10 text-gray-400'
            }`}>
              <span>{trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'}</span>
              <span>{trend.value}</span>
            </div>
            {trend.label && (
              <span className="text-xs text-gray-500">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Hero Status Card - Design minimalista e impactante
const HeroStatusCard = ({ status, isConnected, lastUpdate }) => {
  const statusConfig = {
    UP: {
      color: 'emerald',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      text: 'Sistema Operacional',
      description: 'Todos os serviços funcionando normalmente'
    },
    DOWN: {
      color: 'red',
      icon: (
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      text: 'Sistema Indisponível',
      description: 'Falha detectada nos serviços'
    },
    LOADING: {
      color: 'gray',
      icon: (
        <svg className="w-12 h-12 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ),
      text: 'Verificando Status',
      description: 'Conectando aos serviços...'
    }
  };
  
  const config = status ? statusConfig[status] : statusConfig.LOADING;
  const colorClasses = {
    emerald: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400',
    red: 'from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400',
    gray: 'from-gray-500/20 to-slate-500/20 border-gray-500/30 text-gray-400'
  };
  
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[config.color].split(' ')[0]} ${colorClasses[config.color].split(' ')[1]} border ${colorClasses[config.color].split(' ')[2]} rounded-3xl p-8`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}></div>
      </div>
      
      {/* Pulse effect for active status */}
      {status === 'UP' && (
        <div className="absolute top-8 right-8">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>
      )}
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-sm font-medium text-white/60 mb-2">Status do Portal</p>
            <h2 className={`text-4xl font-bold ${colorClasses[config.color].split(' ')[3]}`}>
              {config.text}
            </h2>
            <p className="text-white/50 mt-2">{config.description}</p>
          </div>
          
          <div className={`${colorClasses[config.color].split(' ')[3]}`}>
            {config.icon}
          </div>
        </div>
        
        {/* Connection status footer */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-white animate-pulse' : 'bg-white/30'}`}></div>
            <span className="text-sm text-white/60">
              {isConnected ? 'Monitoramento Ativo' : 'Reconectando...'}
            </span>
          </div>
          {lastUpdate && (
            <span className="text-xs text-white/40">
              Última atualização: {new Date(lastUpdate).toLocaleTimeString('pt-BR')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Seletor de período estilo segmented control
const TimePeriodSelector = ({ selected, onSelect }) => {
  const periods = [
    { value: "12H", label: "12h", desc: "Últimas 12 horas" },
    { value: "24H", label: "24h", desc: "Último dia" },
    { value: "TDY", label: "Hoje", desc: "Dia atual" }
  ];
  
  return (
    <div className="inline-flex gap-2 p-1 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
      {periods.map(period => (
        <button
          key={period.value}
          onClick={() => onSelect(period.value)}
          title={period.desc}
          className={`relative px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            selected === period.value 
              ? 'bg-white/10 text-white shadow-lg' 
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {period.label}
          {selected === period.value && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 rounded-full"></div>
          )}
        </button>
      ))}
    </div>
  );
};


export default function MonitorDashboard() {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // --- NOVO: Estados para o gráfico e período ---
  const [chartData, setChartData] = useState([]);
  const [timePeriod, setTimePeriod] = useState("TDY"); // Período inicial: Hoje
  const [isAnimating, setIsAnimating] = useState(false);

  // Função para buscar dados históricos
  const fetchHistoricalData = useCallback(async (period) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/historical-data/${period}`);
      const historicalData = await response.json();
      setChartData(historicalData);
    } catch (error) {
      console.error("Falha ao buscar dados históricos:", error);
    }
  }, []);

  // Efeito para buscar dados quando o componente monta ou o período muda
  useEffect(() => {
    fetchHistoricalData(timePeriod);
  }, [timePeriod, fetchHistoricalData]);


  // Efeito para a conexão em tempo real (SSE)
  useEffect(() => {
    const eventSource = new EventSource('http://127.0.0.1:8000/status-stream');
    eventSource.onopen = () => setIsConnected(true);
    eventSource.onerror = () => setIsConnected(false);

    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(newData);
      
      // Trigger animação suave
      setIsAnimating(true);
      
      // --- Adiciona o ponto de dado mais recente ao gráfico em tempo real ---
      setChartData(prevChartData => {
          const updatedChart = [...prevChartData, { timestamp: newData.timestamp, latency: newData.latency }];
          // Para não sobrecarregar, podemos manter apenas os últimos N pontos
          if (updatedChart.length > 500) {
              return updatedChart.slice(updatedChart.length - 500);
          }
          return updatedChart;
      });
      
      // Reset animação após completar
      setTimeout(() => setIsAnimating(false), 600);
    };

    return () => eventSource.close();
  }, []);

  // Calcular média de latência
  const avgLatency = chartData.length > 0 
    ? Math.round(chartData.reduce((sum, d) => sum + (d.latency || 0), 0) / chartData.length)
    : 0;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Animated background pattern */}
      <div className="fixed inset-0 opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      {/* Gradient overlays */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <div className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-slate-950/50">
        <div className="w-full max-w-[1600px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between gap-8">
            {/* Logo e Título */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight whitespace-nowrap">
                  Monitor Portal CCS
                </h1>
                <p className="text-sm text-gray-400 whitespace-nowrap">
                  Monitoramento em tempo real
                </p>
              </div>
            </div>
            
            {/* Stats no canto direito do header */}
            <div className="flex items-center gap-6 flex-shrink-0">
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">Uptime</p>
                <p className="text-lg font-bold text-emerald-400">99.9%</p>
              </div>
              <div className="h-10 w-px bg-white/10"></div>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1 whitespace-nowrap">Última atualização</p>
                <p className="text-sm font-medium text-white whitespace-nowrap">
                  {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString('pt-BR') : '--:--:--'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Centralizado */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-[1600px] mx-auto px-8">
          <div className="space-y-8">
          {/* Hero Status */}
          <HeroStatusCard 
            status={data?.status} 
            isConnected={isConnected}
            lastUpdate={data?.timestamp}
          />

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-6">
            <MetricCard 
              title="Latência Atual" 
              value={data?.latency > 0 ? data.latency : '---'} 
              unit="ms"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              description="Tempo de resposta"
              trend={data?.latency > 0 && avgLatency > 0 ? {
                direction: data.latency < avgLatency ? 'down' : data.latency > avgLatency ? 'up' : 'neutral',
                value: `${Math.abs(((data.latency - avgLatency) / avgLatency * 100).toFixed(1))}%`,
                label: 'vs média'
              } : null}
            />
            <MetricCard 
              title="Latência Média" 
              value={avgLatency > 0 ? avgLatency : '---'} 
              unit="ms"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              description="Média do período"
            />
            <MetricCard 
              title="Status HTTP" 
              value={data?.statusCode || '---'} 
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              description="Código de resposta"
              trend={data?.statusCode === 200 ? {
                direction: 'neutral',
                value: 'OK',
                label: 'Sucesso'
              } : null}
            />
          </div>

          {/* Chart Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Histórico de Latência</h2>
                  <p className="text-sm text-gray-400">Monitoramento contínuo de performance do sistema</p>
                </div>
              </div>
              <TimePeriodSelector selected={timePeriod} onSelect={setTimePeriod} />
            </div>
            
            {/* Chart Container */}
            <div className="relative bg-slate-950/50 rounded-2xl p-6 border border-white/5">
              <div 
                className={`w-full transition-all duration-500 ease-out ${isAnimating ? 'opacity-90 scale-[0.995]' : 'opacity-100 scale-100'}`} 
                style={{ height: 480 }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={chartData} 
                    margin={{ top: 10, right: 40, left: 10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5}/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="rgba(255,255,255,0.05)" 
                      vertical={false}
                    />
                    
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="rgba(255,255,255,0.3)"
                      tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      style={{ fontSize: '12px', fill: 'rgba(255,255,255,0.5)' }}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    
                    <YAxis 
                      stroke="rgba(255,255,255,0.3)"
                      label={{ 
                        value: 'Latência (ms)', 
                        angle: -90, 
                        position: 'insideLeft', 
                        style: { fontSize: '12px', fill: 'rgba(255,255,255,0.5)' } 
                      }}
                      style={{ fontSize: '12px', fill: 'rgba(255,255,255,0.5)' }}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        padding: '12px'
                      }}
                      itemStyle={{ color: '#3b82f6', fontSize: '13px', fontWeight: '500' }}
                      labelStyle={{ color: '#e5e7eb', fontSize: '12px', marginBottom: '4px' }}
                      labelFormatter={(timeStr) => new Date(timeStr).toLocaleString('pt-BR')}
                      cursor={{ stroke: 'rgba(59, 130, 246, 0.2)', strokeWidth: 2 }}
                    />
                    
                    <Area 
                      type="monotone"
                      dataKey="latency" 
                      stroke="#3b82f6" 
                      strokeWidth={3.5} 
                      fill="url(#colorLatency)"
                      name="Latência (ms)"
                      animationDuration={600}
                      animationEasing="ease-in-out"
                      isAnimationActive={true}
                      dot={false}
                      activeDot={{ 
                        r: 7, 
                        fill: '#3b82f6',
                        stroke: '#fff',
                        strokeWidth: 3
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-400">Latência em tempo real</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-white/20"></div>
                  <span className="text-sm text-gray-400">{chartData.length} pontos de dados</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6">
            <p className="text-sm text-gray-500">
              Sistema de monitoramento automático • Atualização em tempo real via Server-Sent Events
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}