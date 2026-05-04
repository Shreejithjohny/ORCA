'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/orca/app-layout';
import { TopNav } from '@/components/orca/top-nav';
import { IncidentFeed } from '@/components/orca/incident-feed';
import { DependencyGraph } from '@/components/orca/dependency-graph';
import { NodeDetailPanel } from '@/components/orca/node-detail-panel';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGraph } from '@/hooks/useGraph';
import type { Incident, GraphNode } from '@/types/orca';

export default function DashboardPage() {
  const { isConnected } = useWebSocket();
  const { graphData, selectedNode, setSelectedNode, highlightedNodes, refetch } = useGraph();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
  };

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  return (
    <AppLayout>
      <TopNav
        title="Dashboard"
        isConnected={isConnected}
        onRefresh={refetch}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Incident Feed */}
        <div className="w-96 flex-shrink-0 border-r border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="font-semibold text-foreground">Live Incidents</h2>
          </div>
          <IncidentFeed onIncidentClick={handleIncidentClick} />
        </div>

        {/* Right Panel - Dependency Graph */}
        <div className="relative flex-1 bg-background">
          <DependencyGraph
            nodes={graphData.nodes}
            links={graphData.links}
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

          {/* Graph Legend */}
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
        </div>
      </div>
    </AppLayout>
  );
}
