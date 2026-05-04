'use client';

import { useState, useCallback, useEffect } from 'react';
import type { GraphData, GraphNode, Severity, AnomalyEvent } from '@/types/orca';

// Dummy graph data
const DUMMY_GRAPH_DATA: GraphData = {
  nodes: [
    { id: 'api', status: 'critical' },
    { id: 'redis', status: 'warning' },
    { id: 'neo4j', status: 'healthy' },
    { id: 'backend', status: 'healthy' },
    { id: 'auth', status: 'healthy' },
    { id: 'postgres', status: 'warning' },
    { id: 'kafka', status: 'healthy' },
  ],
  links: [
    { source: 'api', target: 'redis' },
    { source: 'api', target: 'neo4j' },
    { source: 'api', target: 'auth' },
    { source: 'backend', target: 'redis' },
    { source: 'backend', target: 'postgres' },
    { source: 'backend', target: 'kafka' },
    { source: 'auth', target: 'postgres' },
  ],
};

export function useGraph() {
  const [graphData, setGraphData] = useState<GraphData>(DUMMY_GRAPH_DATA);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGraph = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with real API call when backend is ready
      // const data = await api.fetchGraphData();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      setGraphData(DUMMY_GRAPH_DATA);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch graph data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  const updateNodeStatus = useCallback((nodeId: string, status: Severity) => {
    setGraphData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, status } : node
      ),
    }));
  }, []);

  const highlightNode = useCallback((nodeId: string) => {
    setHighlightedNodes(prev => new Set([...prev, nodeId]));
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      setHighlightedNodes(prev => {
        const next = new Set(prev);
        next.delete(nodeId);
        return next;
      });
    }, 3000);
  }, []);

  const handleAnomalyEvent = useCallback((event: AnomalyEvent) => {
    // Extract service name from node (e.g., 'pod-api-3' -> 'api')
    const nodeId = event.node.replace(/^pod-/, '').replace(/-\d+$/, '');
    
    // Determine severity based on value vs threshold
    const severity: Severity = event.value >= event.threshold * 1.2 
      ? 'critical' 
      : event.value >= event.threshold 
        ? 'warning' 
        : 'healthy';
    
    updateNodeStatus(nodeId, severity);
    highlightNode(nodeId);
  }, [updateNodeStatus, highlightNode]);

  return {
    graphData,
    selectedNode,
    setSelectedNode,
    highlightedNodes,
    isLoading,
    error,
    refetch: fetchGraph,
    updateNodeStatus,
    highlightNode,
    handleAnomalyEvent,
  };
}
