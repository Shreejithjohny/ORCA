'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/orca/app-layout';
import { TopNav } from '@/components/orca/top-nav';
import { DependencyGraph } from '@/components/orca/dependency-graph';
import { NodeDetailPanel } from '@/components/orca/node-detail-panel';
import { SeverityBadge } from '@/components/orca/severity-badge';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGraph } from '@/hooks/useGraph';
import type { GraphNode, Severity } from '@/types/orca';

export default function GraphPage() {
  const { isConnected } = useWebSocket();
  const { graphData, selectedNode, setSelectedNode, highlightedNodes, refetch } = useGraph();
  const [filterStatus, setFilterStatus] = useState<Severity | 'all'>('all');

  const filteredNodes = filterStatus === 'all'
    ? graphData.nodes
    : graphData.nodes.filter((node) => node.status === filterStatus);

  const filteredLinks = graphData.links.filter((link) => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    return (
      filteredNodes.some((n) => n.id === sourceId) &&
      filteredNodes.some((n) => n.id === targetId)
    );
  });

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const statusCounts = {
    critical: graphData.nodes.filter((n) => n.status === 'critical').length,
    warning: graphData.nodes.filter((n) => n.status === 'warning').length,
    healthy: graphData.nodes.filter((n) => n.status === 'healthy').length,
  };

  return (
    <AppLayout>
      <TopNav
        title="Service Graph"
        isConnected={isConnected}
        onRefresh={refetch}
      />

      <div className="relative flex-1 overflow-hidden">
        {/* Filter Controls */}
        <div className="absolute left-4 top-4 z-10 flex gap-2 rounded-lg border border-border bg-card/95 backdrop-blur-sm p-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`rounded px-3 py-1 text-sm transition-colors ${
              filterStatus === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            All ({graphData.nodes.length})
          </button>
          <button
            onClick={() => setFilterStatus('critical')}
            className={`rounded px-3 py-1 text-sm transition-colors ${
              filterStatus === 'critical'
                ? 'bg-red-500 text-white'
                : 'hover:bg-muted'
            }`}
          >
            Critical ({statusCounts.critical})
          </button>
          <button
            onClick={() => setFilterStatus('warning')}
            className={`rounded px-3 py-1 text-sm transition-colors ${
              filterStatus === 'warning'
                ? 'bg-yellow-500 text-white'
                : 'hover:bg-muted'
            }`}
          >
            Warning ({statusCounts.warning})
          </button>
          <button
            onClick={() => setFilterStatus('healthy')}
            className={`rounded px-3 py-1 text-sm transition-colors ${
              filterStatus === 'healthy'
                ? 'bg-green-500 text-white'
                : 'hover:bg-muted'
            }`}
          >
            Healthy ({statusCounts.healthy})
          </button>
        </div>

        {/* Graph */}
        <DependencyGraph
          nodes={filteredNodes}
          links={filteredLinks}
          highlightedNodes={highlightedNodes}
          selectedNode={selectedNode}
          onNodeClick={handleNodeClick}
        />

        {/* Node Detail Panel */}
        {selectedNode && (
          <div className="absolute right-4 top-4">
            <NodeDetailPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 rounded-lg border border-border bg-card/95 backdrop-blur-sm p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Legend</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-xs">Healthy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-yellow-500" />
              <span className="text-xs">Warning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-xs">Critical</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 right-4 rounded-lg border border-border bg-card/95 backdrop-blur-sm p-3">
          <p className="text-xs text-muted-foreground">
            Drag to move nodes. Scroll to zoom. Click nodes for details.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
