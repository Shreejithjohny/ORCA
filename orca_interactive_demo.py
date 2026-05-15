#!/usr/bin/env python3
"""
ORCA Platform Interactive Demo
Shows all core functionality without Kubernetes
Run this to understand the ORCA platform end-to-end
"""

import json
import time
from typing import List, Dict, Any
from datetime import datetime, timedelta
import redis

# Colors for console output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_section(title: str):
    """Print a formatted section header"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.CYAN}► {title}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.ENDC}\n")

def print_success(msg: str):
    """Print success message"""
    print(f"{Colors.GREEN}✓ {msg}{Colors.ENDC}")

def print_info(msg: str):
    """Print info message"""
    print(f"{Colors.CYAN}ℹ {msg}{Colors.ENDC}")

def print_warning(msg: str):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠ {msg}{Colors.ENDC}")

def print_code(label: str, code: str):
    """Print code block"""
    print(f"{Colors.YELLOW}{label}:{Colors.ENDC}")
    print(f"{Colors.BOLD}{code}{Colors.ENDC}\n")

class ORCADemo:
    """ORCA Platform Demo - Simulates the entire observability platform"""
    
    def __init__(self):
        self.incidents = []
        self.service_graph = {}
        self.metrics = {}
        self.logs = []
        
    def demo_1_backend_api(self):
        """Demo 1: Backend API Endpoints"""
        print_section("DEMO 1: Backend API Endpoints")
        
        print_info("The ORCA backend provides REST APIs for incident management and analysis\n")
        
        # Health check endpoint
        print_code("Health Check Endpoint", "GET /health/llm")
        response = {
            "status": "ok",
            "model": "mistral",
            "available": False,
            "uptime_seconds": 3847,
            "version": "1.0.0"
        }
        print(f"{Colors.GREEN}{json.dumps(response, indent=2)}{Colors.ENDC}\n")
        print_success("Backend is responsive and healthy\n")
        
        # Log ingestion endpoint
        print_code("Log Ingestion Endpoint", "POST /ingest/logs")
        log_payload = {
            "kubernetes": {
                "namespace_name": "production",
                "pod_name": "redis-cache-1",
                "container_name": "redis"
            },
            "message": "Connection timeout to database",
            "level": "ERROR",
            "timestamp": datetime.now().isoformat()
        }
        print(f"{Colors.BLUE}{json.dumps(log_payload, indent=2)}{Colors.ENDC}\n")
        
        response = {
            "status": "ok",
            "stream": "logs:production:redis-cache-1",
            "entries_received": 1
        }
        print(f"Response: {Colors.GREEN}{json.dumps(response, indent=2)}{Colors.ENDC}\n")
        print_success("Logs ingested successfully\n")
        
        # Incident explanation endpoint
        print_code("Incident Analysis Endpoint", "POST /incident/explain")
        incident = {
            "id": "INC-001",
            "severity": "critical",
            "service": "redis",
            "message": "Memory usage at 94% - potential OOM condition",
            "confidence": 0.94,
            "timestamp": datetime.now().isoformat(),
            "affected_pods": ["redis-cache-1", "redis-cache-2"]
        }
        print(f"{Colors.BLUE}{json.dumps(incident, indent=2)}{Colors.ENDC}\n")
        
        response = {
            "explanation": "Critical memory pressure detected on Redis cache cluster",
            "confidence": 0.94,
            "source": "llm_analyzer",
            "recommendations": [
                "Increase cache eviction policies",
                "Monitor memory growth trend",
                "Scale horizontally if needed",
                "Check for memory leaks in client connections"
            ]
        }
        print(f"Analysis: {Colors.GREEN}{json.dumps(response, indent=2)}{Colors.ENDC}\n")
        print_success("Incident analyzed with recommendations\n")
        
        input(f"{Colors.YELLOW}Press Enter to continue...{Colors.ENDC}")
    
    def demo_2_redis_streams(self):
        """Demo 2: Redis Data Bus (Streams)"""
        print_section("DEMO 2: Redis Data Bus & Streams")
        
        print_info("Redis acts as the central data bus for incident logs and network flows\n")
        
        # Simulate Redis streams
        print_code("Redis Stream: Logs", "XREAD COUNT 5 STREAMS logs:production:api-server 0")
        
        logs = [
            {
                "timestamp": (datetime.now() - timedelta(minutes=5)).isoformat(),
                "level": "WARNING",
                "message": "High latency detected: 2500ms response time"
            },
            {
                "timestamp": (datetime.now() - timedelta(minutes=4)).isoformat(),
                "level": "WARNING",
                "message": "Connection pool exhausted, rejecting new requests"
            },
            {
                "timestamp": (datetime.now() - timedelta(minutes=3)).isoformat(),
                "level": "ERROR",
                "message": "Database query timeout after 30 seconds"
            },
            {
                "timestamp": (datetime.now() - timedelta(minutes=2)).isoformat(),
                "level": "ERROR",
                "message": "Service degradation - unable to process requests"
            },
            {
                "timestamp": (datetime.now() - timedelta(minutes=1)).isoformat(),
                "level": "CRITICAL",
                "message": "Incident escalated - manual intervention required"
            }
        ]
        
        for i, log in enumerate(logs, 1):
            print(f"{Colors.CYAN}[{i}] {log['timestamp']}{Colors.ENDC}")
            print(f"    {Colors.YELLOW}{log['level']}: {log['message']}{Colors.ENDC}")
        
        print()
        print_success("5 log entries retrieved from Redis stream\n")
        
        # Network flows
        print_code("Redis Stream: Network Flows (eBPF traced)", "XREAD COUNT 3 STREAMS netflows:production:unknown 0")
        
        flows = [
            {"src": "api-server.prod", "dst": "postgres.prod", "dst_port": 5432, "bytes": 4096, "protocol": "TCP"},
            {"src": "api-server.prod", "dst": "redis.prod", "dst_port": 6379, "bytes": 1024, "protocol": "TCP"},
            {"src": "redis.prod", "dst": "backup-storage.prod", "dst_port": 9200, "bytes": 8192, "protocol": "TCP"},
        ]
        
        for i, flow in enumerate(flows, 1):
            print(f"{Colors.CYAN}[{i}] {flow['src']} → {flow['dst']}:{flow['dst_port']}{Colors.ENDC}")
            print(f"    Protocol: {flow['protocol']}, Bytes: {flow['bytes']}")
        
        print()
        print_success("Network flows captured by eBPF\n")
        
        input(f"{Colors.YELLOW}Press Enter to continue...{Colors.ENDC}")
    
    def demo_3_neo4j_graph(self):
        """Demo 3: Neo4j Service Dependency Graph"""
        print_section("DEMO 3: Neo4j Graph Database - Service Dependencies")
        
        print_info("Neo4j stores the service topology and relationships\n")
        
        # Cypher query
        print_code("Cypher Query", "MATCH (a:Service)-[r:CALLS]->(b:Service) RETURN a.name, r.latency_ms, b.name")
        
        print(f"{Colors.CYAN}Service Dependencies:{Colors.ENDC}\n")
        
        dependencies = [
            ("frontend", "50ms", "api-gateway"),
            ("api-gateway", "120ms", "auth-service"),
            ("api-gateway", "150ms", "user-service"),
            ("user-service", "75ms", "postgres"),
            ("user-service", "10ms", "redis"),
            ("auth-service", "20ms", "redis"),
            ("api-gateway", "200ms", "notification-service"),
            ("notification-service", "5ms", "kafka"),
        ]
        
        for src, latency, dst in dependencies:
            print(f"  {Colors.GREEN}{src}{Colors.ENDC} --({latency})--> {Colors.BLUE}{dst}{Colors.ENDC}")
        
        print()
        
        # Critical path analysis
        print_code("Critical Dependency Analysis", "Match critical paths (latency > 100ms)")
        
        critical = [dep for dep in dependencies if int(dep[1].split('m')[0]) > 100]
        
        print(f"{Colors.RED}Critical paths found: {len(critical)}{Colors.ENDC}\n")
        for src, latency, dst in critical:
            print(f"  {Colors.RED}ALERT: {src} → {dst} ({latency}){Colors.ENDC}")
        
        print()
        print_success("Graph analysis complete - 3 critical paths identified\n")
        
        input(f"{Colors.YELLOW}Press Enter to continue...{Colors.ENDC}")
    
    def demo_4_incident_correlation(self):
        """Demo 4: Incident Correlation & Analysis"""
        print_section("DEMO 4: Incident Correlation & Root Cause Analysis")
        
        print_info("ORCA correlates multiple signals to identify root causes\n")
        
        # Create an incident scenario
        print_code("Scenario", "Service degradation detected across multiple components")
        
        print(f"{Colors.YELLOW}Timeline of Events:{Colors.ENDC}\n")
        
        events = [
            ("14:23:10", "WARNING", "Redis memory usage spike (85% → 92%)"),
            ("14:23:35", "WARNING", "Database connection pool exhausted on API server"),
            ("14:24:05", "ERROR", "API response time > 5000ms"),
            ("14:24:20", "CRITICAL", "User facing errors - service degradation"),
            ("14:24:45", "INFO", "Auto-scaling triggered - adding 3 new API replicas"),
            ("14:25:30", "WARNING", "Memory still high (89%), cache eviction active"),
            ("14:26:15", "INFO", "Traffic shifted to new replicas"),
            ("14:27:00", "SUCCESS", "Service recovered - latency < 200ms"),
        ]
        
        for time_str, level, msg in events:
            color = {
                "WARNING": Colors.YELLOW,
                "ERROR": Colors.RED,
                "CRITICAL": Colors.RED,
                "INFO": Colors.CYAN,
                "SUCCESS": Colors.GREEN
            }.get(level, Colors.CYAN)
            
            print(f"  {Colors.BLUE}{time_str}{Colors.ENDC} {color}[{level}]{Colors.ENDC} {msg}")
        
        print()
        
        # Root cause analysis
        print_code("Root Cause Analysis", "LLM-powered incident investigation")
        
        analysis = {
            "root_cause": "Memory leak in Redis client connection pooling",
            "confidence": 0.87,
            "contributing_factors": [
                "High concurrent connections (1200+)",
                "Connection timeout not releasing memory",
                "Cumulative effect over 48 hours"
            ],
            "recommended_actions": [
                "Update Redis client library to v4.5.2",
                "Reduce connection pool timeout from 600s to 300s",
                "Add memory monitoring alerts at 75% threshold",
                "Schedule restart of Redis cache every 24 hours"
            ],
            "estimated_prevention": "Would prevent 95% of similar incidents"
        }
        
        print(json.dumps(analysis, indent=2))
        print()
        print_success("Root cause identified with confidence 0.87\n")
        
        input(f"{Colors.YELLOW}Press Enter to continue...{Colors.ENDC}")
    
    def demo_5_prometheus_metrics(self):
        """Demo 5: Prometheus Metrics & Monitoring"""
        print_section("DEMO 5: Prometheus Metrics & Real-Time Monitoring")
        
        print_info("Prometheus collects and aggregates system metrics\n")
        
        print_code("Available Metrics", "Querying Prometheus for system health")
        
        metrics = {
            "node_cpu_seconds_total": {
                "query": "rate(node_cpu_seconds_total[5m])",
                "values": {"node1": "15%", "node2": "28%", "node3": "12%"}
            },
            "node_memory_MemAvailable_bytes": {
                "query": "node_memory_MemAvailable_bytes / 1024 / 1024 / 1024",
                "values": {"node1": "6.2GB", "node2": "4.8GB", "node3": "7.1GB"}
            },
            "node_disk_free_bytes": {
                "query": "node_disk_free_bytes / 1024 / 1024 / 1024",
                "values": {"node1": "120GB", "node2": "95GB", "node3": "150GB"}
            },
            "kube_pod_info": {
                "query": "count(kube_pod_info)",
                "values": {"total_pods": "42", "running": "40", "pending": "2"}
            }
        }
        
        for metric_name, metric_data in metrics.items():
            print(f"{Colors.CYAN}{metric_name}{Colors.ENDC}")
            print(f"  Query: {metric_data['query']}")
            for key, val in metric_data['values'].items():
                print(f"    {key}: {val}")
            print()
        
        print_success("Metrics retrieved successfully\n")
        
        input(f"{Colors.YELLOW}Press Enter to continue...{Colors.ENDC}")
    
    def demo_6_dashboard(self):
        """Demo 6: Frontend Dashboard Preview"""
        print_section("DEMO 6: Frontend Dashboard - Web UI Preview")
        
        print_info("The Next.js dashboard provides real-time incident visualization\n")
        
        print(f"{Colors.BOLD}{Colors.BLUE}Dashboard Sections:{Colors.ENDC}\n")
        
        dashboard_sections = {
            "Incidents Tab": {
                "description": "Real-time incident feed",
                "features": [
                    "Live incident list with severity indicators",
                    "Sort by severity, time, affected service",
                    "Drill-down into incident details",
                    "Manual incident annotation and resolution"
                ]
            },
            "Dashboard Tab": {
                "description": "System health overview",
                "features": [
                    "Service health status (OK/Warning/Critical)",
                    "Real-time metric graphs (CPU, Memory, I/O)",
                    "Top N slowest services",
                    "Error rate trends"
                ]
            },
            "Graph Tab": {
                "description": "Service dependency visualization",
                "features": [
                    "Interactive 3D service graph",
                    "Node sizing by traffic volume",
                    "Color-coded health status",
                    "Latency information on edges",
                    "Drill-down to service details"
                ]
            },
            "Metrics Tab": {
                "description": "Prometheus metrics explorer",
                "features": [
                    "Custom metric queries",
                    "Time-series graphs",
                    "Alert threshold configuration",
                    "Export data to CSV"
                ]
            },
            "Settings Tab": {
                "description": "Configuration management",
                "features": [
                    "LLM model selection",
                    "Alert threshold tuning",
                    "Integration configuration",
                    "User preferences"
                ]
            }
        }
        
        for section, details in dashboard_sections.items():
            print(f"{Colors.GREEN}{section}{Colors.ENDC}")
            print(f"  {details['description']}")
            for feature in details['features']:
                print(f"    • {feature}")
            print()
        
        print_success("Dashboard provides comprehensive observability\n")
        
        input(f"{Colors.YELLOW}Press Enter to continue...{Colors.ENDC}")
    
    def demo_7_end_to_end(self):
        """Demo 7: End-to-End Workflow"""
        print_section("DEMO 7: Complete End-to-End Workflow")
        
        print_info("Watch how ORCA processes an incident from detection to resolution\n")
        
        workflow = [
            {
                "step": 1,
                "component": "eBPF Monitor",
                "action": "Detects unusual network traffic pattern",
                "output": "1000 TCP connections from api-server to unknown host"
            },
            {
                "step": 2,
                "component": "Backend /ingest/logs",
                "action": "Receives pod logs via Fluent-bit",
                "output": "ERROR: Failed to establish database connection (10 times)"
            },
            {
                "step": 3,
                "component": "Redis Streams",
                "action": "Stores logs and network flows",
                "output": "logs:prod:api-server → 450 entries, netflows:prod:unknown → 1000 entries"
            },
            {
                "step": 4,
                "component": "Neo4j Graph",
                "action": "Finds critical dependency paths",
                "output": "api-server → database → backup-storage (critical path)"
            },
            {
                "step": 5,
                "component": "NLP Analysis",
                "action": "Correlates signals and determines root cause",
                "output": "Root cause: Database connection pool exhaustion (92% confidence)"
            },
            {
                "step": 6,
                "component": "Prometheus",
                "action": "Metrics confirm degradation",
                "output": "DB latency: 2500ms, Error rate: 15%, Response time: 8000ms"
            },
            {
                "step": 7,
                "component": "Frontend Dashboard",
                "action": "Incident visualized with recommendations",
                "output": "User sees incident details + auto-scaling recommendation"
            },
            {
                "step": 8,
                "component": "Backend /incident/explain",
                "action": "Provides actionable recommendations",
                "output": "Increase connection pool size from 100 to 200"
            }
        ]
        
        for item in workflow:
            print(f"{Colors.BOLD}{Colors.BLUE}Step {item['step']}: {item['component']}{Colors.ENDC}")
            print(f"  Action:  {item['action']}")
            print(f"  {Colors.GREEN}Output:  {item['output']}{Colors.ENDC}\n")
        
        print_success("Complete incident detection → analysis → resolution cycle\n")
        
        input(f"{Colors.YELLOW}Press Enter to see summary...{Colors.ENDC}")
    
    def summary(self):
        """Display summary"""
        print_section("ORCA Platform Summary")
        
        summary_text = f"""
{Colors.BOLD}ORCA Architecture Components:{Colors.ENDC}

1. {Colors.GREEN}eBPF Monitor{Colors.ENDC}
   • Kernel-level network tracing
   • Zero-overhead TCP connection tracking
   • Real-time flow capture

2. {Colors.GREEN}Fluent-bit Pipeline{Colors.ENDC}
   • Log collection from all pods
   • Structured log processing
   • Forwarding to backend

3. {Colors.GREEN}Redis Data Bus{Colors.ENDC}
   • High-speed event streaming
   • Distributed log storage
   • Network flow persistence

4. {Colors.GREEN}Neo4j Graph DB{Colors.ENDC}
   • Service dependency mapping
   • Relationship analysis
   • Critical path identification

5. {Colors.GREEN}FastAPI Backend{Colors.ENDC}
   • Log ingestion API
   • Incident analysis endpoints
   • Real-time WebSocket updates

6. {Colors.GREEN}Prometheus Monitoring{Colors.ENDC}
   • System metric collection
   • Time-series data storage
   • Alert generation

7. {Colors.GREEN}LLM Analysis{Colors.ENDC}
   • NLP-powered root cause analysis
   • Incident correlation
   • Recommendations generation

8. {Colors.GREEN}Next.js Dashboard{Colors.ENDC}
   • Real-time incident visualization
   • Service dependency graphs
   • Metrics exploration

{Colors.BOLD}Data Flow:{Colors.ENDC}

  Pods/Nodes
      ↓ (logs, network flows, metrics)
  eBPF + Fluent-bit
      ↓
  Backend API
      ↓
  Redis Streams + Neo4j + Prometheus
      ↓
  LLM Analysis
      ↓
  Dashboard + Alerts

{Colors.BOLD}Key Capabilities:{Colors.ENDC}

  ✓ Real-time incident detection
  ✓ Automatic root cause analysis
  ✓ Service dependency visualization
  ✓ LLM-powered insights
  ✓ Multi-signal correlation
  ✓ Actionable recommendations
  ✓ Zero-overhead tracing (eBPF)
  ✓ Scalable to 1000+ services
"""
        
        print(summary_text)
        
        print(f"\n{Colors.BOLD}{Colors.GREEN}Next Steps:{Colors.ENDC}\n")
        print("1. Restart your computer (required for WSL2 to fully install)")
        print("2. Open Ubuntu terminal")
        print("3. Run: bash /mnt/c/Users/shree/Documents/ORCA/quick-setup-ubuntu.sh")
        print("4. Wait 5-10 minutes for services to deploy")
        print("5. Start port-forwarding in 4 terminal windows")
        print("6. Access dashboard at http://localhost:3000\n")
    
    def run(self):
        """Run the complete demo"""
        print(f"\n{Colors.BOLD}{Colors.CYAN}")
        print("╔══════════════════════════════════════════════════════════════════╗")
        print("║                  ORCA Platform - Interactive Demo                ║")
        print("║           Observability, Reliability, Correlation, Analysis      ║")
        print("╚══════════════════════════════════════════════════════════════════╝")
        print(Colors.ENDC)
        
        try:
            self.demo_1_backend_api()
            self.demo_2_redis_streams()
            self.demo_3_neo4j_graph()
            self.demo_4_incident_correlation()
            self.demo_5_prometheus_metrics()
            self.demo_6_dashboard()
            self.demo_7_end_to_end()
            self.summary()
            
            print(f"{Colors.BOLD}{Colors.GREEN}")
            print("╔══════════════════════════════════════════════════════════════════╗")
            print("║                    Demo Complete!                               ║")
            print("║                   Ready to Deploy ORCA                          ║")
            print("╚══════════════════════════════════════════════════════════════════╝")
            print(Colors.ENDC)
            
        except KeyboardInterrupt:
            print(f"\n{Colors.YELLOW}Demo interrupted by user{Colors.ENDC}\n")

if __name__ == "__main__":
    demo = ORCADemo()
    demo.run()
