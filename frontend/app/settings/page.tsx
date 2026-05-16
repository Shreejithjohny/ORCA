'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/orca/app-layout';
import { TopNav } from '@/components/orca/top-nav';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function SettingsPage() {
  const { isConnected } = useWebSocket();
  const [wsUrl, setWsUrl] = useState('ws://localhost:8000/ws');
  const [apiUrl, setApiUrl] = useState('http://localhost:8000/api');
  const [refreshInterval, setRefreshInterval] = useState('10');
  const [cpuThreshold, setCpuThreshold] = useState('80');
  const [memoryThreshold, setMemoryThreshold] = useState('80');
  const [storageThreshold, setStorageThreshold] = useState('90');

  const handleSave = () => {
    // TODO: Implement settings persistence
    // Settings saved successfully in state
  };

  return (
    <AppLayout>
      <TopNav
        title="Settings"
        isConnected={isConnected}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Connection Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Connection Settings</CardTitle>
              <CardDescription>
                Configure the WebSocket and API endpoints for ORCA.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ws-url">WebSocket URL</Label>
                <Input
                  id="ws-url"
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  placeholder="ws://localhost:8000/ws"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-url">API URL</Label>
                <Input
                  id="api-url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="http://localhost:8000/api"
                />
              </div>
            </CardContent>
          </Card>

          {/* Refresh Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Refresh Settings</CardTitle>
              <CardDescription>
                Configure how often the dashboard refreshes data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
                <Input
                  id="refresh-interval"
                  type="number"
                  min="5"
                  max="60"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Alert Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Thresholds</CardTitle>
              <CardDescription>
                Set the thresholds for metric alerts. Values above these will trigger warnings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cpu-threshold">CPU (%)</Label>
                  <Input
                    id="cpu-threshold"
                    type="number"
                    min="50"
                    max="100"
                    value={cpuThreshold}
                    onChange={(e) => setCpuThreshold(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memory-threshold">Memory (%)</Label>
                  <Input
                    id="memory-threshold"
                    type="number"
                    min="50"
                    max="100"
                    value={memoryThreshold}
                    onChange={(e) => setMemoryThreshold(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storage-threshold">Storage (%)</Label>
                  <Input
                    id="storage-threshold"
                    type="number"
                    min="50"
                    max="100"
                    value={storageThreshold}
                    onChange={(e) => setStorageThreshold(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
