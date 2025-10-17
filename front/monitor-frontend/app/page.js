// pages/index.js (ou app/page.js)
import MonitorDashboard from '@/components/MonitorDashboard';

export default function HomePage() {
  return (
    <main className="w-full h-screen overflow-auto">
      <MonitorDashboard />
    </main>
  );
}