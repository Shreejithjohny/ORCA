'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/components/orca/app-layout';
import { TopNav } from '@/components/orca/top-nav';
import { FilterTabs } from '@/components/orca/filter-tabs';
import { SeverityBadge } from '@/components/orca/severity-badge';
import { ConfidenceScore } from '@/components/orca/confidence-score';
import { AIChatPanel } from '@/components/orca/ai-chat-panel';
import { Button } from '@/components/ui/button';
import { useIncidents } from '@/hooks/useIncidents';
import { useWebSocket } from '@/hooks/useWebSocket';
import { formatDistanceToNow } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function IncidentsPage() {
  const { isConnected } = useWebSocket();
  const { incidents, allIncidents, filter, setFilter, updateIncident } = useIncidents();
  const [search, setSearch] = useState('');
  const [chatOpen, setChatOpen] = useState(false);

  const filteredIncidents = incidents.filter(
    (inc) =>
      inc.service.toLowerCase().includes(search.toLowerCase()) ||
      inc.message.toLowerCase().includes(search.toLowerCase()) ||
      inc.id.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    all: allIncidents.length,
    critical: allIncidents.filter((inc) => inc.severity === 'critical').length,
    warning: allIncidents.filter((inc) => inc.severity === 'warning').length,
    resolved: allIncidents.filter((inc) => inc.status === 'resolved').length,
  };

  return (
    <AppLayout>
      <TopNav
        title="Incidents"
        isConnected={isConnected}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search incidents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <FilterTabs value={filter} onChange={setFilter} counts={counts} />
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <Table>
              <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Service</TableHead>
                <TableHead className="hidden md:table-cell">Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Confidence</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No incidents found
                  </TableCell>
                </TableRow>
              ) : (
                filteredIncidents.map((incident) => (
                  <TableRow key={incident.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{incident.id}</TableCell>
                    <TableCell>
                      <SeverityBadge severity={incident.severity} />
                    </TableCell>
                    <TableCell className="font-medium">{incident.service}</TableCell>
                    <TableCell className="hidden max-w-xs truncate md:table-cell">
                      {incident.message}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          incident.status === 'open'
                            ? 'bg-red-100 text-red-700'
                            : incident.status === 'acknowledged'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {incident.status}
                      </span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {incident.confidence && (
                        <ConfidenceScore score={incident.confidence} />
                      )}
                    </TableCell>
                    <TableCell>
                      {incident.status !== 'resolved' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await updateIncident(incident.id, { status: 'resolved' });
                            } catch (err) {
                              console.error('Failed to resolve incident', err);
                            }
                          }}
                        >
                          Resolve
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">Resolved</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground" suppressHydrationWarning>
                      {formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AIChatPanel open={chatOpen} onOpenChange={setChatOpen} />
    </AppLayout>
  );
}
