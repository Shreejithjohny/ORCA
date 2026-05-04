'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SeverityBadge } from './severity-badge';
import { StatusDot } from './status-dot';
import type { GraphNode } from '@/types/orca';

interface NodeDetailPanelProps {
  node: GraphNode;
  onClose: () => void;
}

// Dummy service details
const serviceDetails: Record<string, { description: string; pods: number; replicas: number; memory: string; cpu: string }> = {
  api: { description: 'Main API Gateway', pods: 3, replicas: 3, memory: '512Mi', cpu: '250m' },
  redis: { description: 'In-memory cache', pods: 2, replicas: 2, memory: '1Gi', cpu: '500m' },
  neo4j: { description: 'Graph database', pods: 1, replicas: 1, memory: '2Gi', cpu: '1000m' },
  backend: { description: 'Backend service', pods: 4, replicas: 4, memory: '1Gi', cpu: '500m' },
  auth: { description: 'Authentication service', pods: 2, replicas: 2, memory: '256Mi', cpu: '100m' },
  postgres: { description: 'PostgreSQL database', pods: 1, replicas: 1, memory: '4Gi', cpu: '2000m' },
  kafka: { description: 'Message broker', pods: 3, replicas: 3, memory: '2Gi', cpu: '1000m' },
};

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  const details = serviceDetails[node.id] || {
    description: 'Unknown service',
    pods: 1,
    replicas: 1,
    memory: 'N/A',
    cpu: 'N/A',
  };

  return (
    <Card className="w-80 shadow-xl border-border bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <StatusDot status={node.status} size="lg" pulse={node.status === 'critical'} />
            <CardTitle className="text-lg">{node.id}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <SeverityBadge severity={node.status} />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{details.description}</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-muted-foreground">Pods</span>
            <p className="text-sm font-medium">{details.pods}/{details.replicas}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Memory</span>
            <p className="text-sm font-medium">{details.memory}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">CPU</span>
            <p className="text-sm font-medium">{details.cpu}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Status</span>
            <p className="text-sm font-medium capitalize">{node.status}</p>
          </div>
        </div>

        {node.status !== 'healthy' && (
          <div className="rounded-lg bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              {node.status === 'critical'
                ? 'Service requires immediate attention'
                : 'Service showing warning signs'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
