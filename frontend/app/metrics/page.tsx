'use client';

import { Cpu, HardDrive, MemoryStick } from 'lucide-react';
import { AppLayout } from '@/components/orca/app-layout';
import { TopNav } from '@/components/orca/top-nav';
import { TimeRangeSelector } from '@/components/orca/time-range-selector';
import { MetricsChart } from '@/components/orca/metrics-chart';
import { MetricsTile } from '@/components/orca/metrics-tile';
import { useMetrics } from '@/hooks/useMetrics';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function MetricsPage() {
  const { isConnected } = useWebSocket();
  const { metrics, currentMetrics, timeRange, setTimeRange, isLoading, refetch } = useMetrics();

  // Get previous values for trend calculation
  const previousMetrics = metrics.length > 1 ? metrics[metrics.length - 2] : null;

  return (
    <AppLayout>
      <TopNav
        title="Metrics"
        isConnected={isConnected}
        onRefresh={refetch}
        isRefreshing={isLoading}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Time Range Selector */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">System Metrics</h2>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        {/* Metric Tiles */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <MetricsTile
            title="CPU Usage"
            value={currentMetrics?.cpu ?? 0}
            previousValue={previousMetrics?.cpu}
            icon={<Cpu className="h-5 w-5" />}
          />
          <MetricsTile
            title="Memory Usage"
            value={currentMetrics?.memory ?? 0}
            previousValue={previousMetrics?.memory}
            icon={<MemoryStick className="h-5 w-5" />}
          />
          <MetricsTile
            title="Storage Usage"
            value={currentMetrics?.storage ?? 0}
            previousValue={previousMetrics?.storage}
            icon={<HardDrive className="h-5 w-5" />}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <MetricsChart
            title="CPU Usage"
            data={metrics}
            dataKey="cpu"
            color="#3b82f6"
            currentValue={currentMetrics?.cpu}
          />
          <MetricsChart
            title="Memory Usage"
            data={metrics}
            dataKey="memory"
            color="#8b5cf6"
            currentValue={currentMetrics?.memory}
          />
          <MetricsChart
            title="Storage Usage"
            data={metrics}
            dataKey="storage"
            color="#22c55e"
            currentValue={currentMetrics?.storage}
          />
        </div>
      </div>
    </AppLayout>
  );
}
