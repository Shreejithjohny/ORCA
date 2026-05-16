'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { cn } from '@/lib/utils';
import type { GraphNode, GraphLink, Severity } from '@/types/orca';

interface DependencyGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  highlightedNodes?: Set<string>;
  selectedNode?: GraphNode | null;
  onNodeClick?: (node: GraphNode) => void;
  className?: string;
}

const statusColors: Record<Severity, string> = {
  critical: '#ef4444',
  warning: '#eab308',
  healthy: '#22c55e',
  unknown: '#9ca3af',
};

export function DependencyGraph({
  nodes,
  links,
  highlightedNodes = new Set(),
  selectedNode,
  onNodeClick,
  className,
}: DependencyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderGraph = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear existing
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const g = svg.append('g');

    // Create simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links)
        .id((d: d3.SimulationNodeDatum) => (d as GraphNode).id)
        .distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Create arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#4b5563');

    // Draw links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#4b5563')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrowhead)');

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick?.(d);
      });

    // Node circles
    node.append('circle')
      .attr('r', 20)
      .attr('fill', (d) => statusColors[d.status])
      .attr('stroke', (d) => 
        highlightedNodes.has(d.id) ? '#22d3ee' : 
        selectedNode?.id === d.id ? '#22d3ee' : 'rgba(255,255,255,0.1)'
      )
      .attr('stroke-width', (d) => 
        highlightedNodes.has(d.id) || selectedNode?.id === d.id ? 3 : 1
      )
      .attr('class', (d) => highlightedNodes.has(d.id) ? 'animate-pulse' : '');

    // Node labels
    node.append('text')
      .text((d) => d.id)
      .attr('text-anchor', 'middle')
      .attr('dy', 35)
      .attr('fill', '#e5e7eb')
      .attr('font-size', 11)
      .attr('font-weight', 500);

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
        .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
        .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
        .attr('y2', (d) => (d.target as GraphNode).y ?? 0);

      node.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [nodes, links, highlightedNodes, selectedNode, onNodeClick]);

  useEffect(() => {
    const cleanup = renderGraph();

    const handleResize = () => {
      cleanup?.();
      renderGraph();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cleanup?.();
      window.removeEventListener('resize', handleResize);
    };
  }, [renderGraph]);

  return (
    <div ref={containerRef} className={cn('h-full w-full', className)}>
      <svg ref={svgRef} className="h-full w-full" />
    </div>
  );
}
