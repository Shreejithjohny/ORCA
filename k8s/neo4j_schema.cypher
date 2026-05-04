// ORCA Neo4j schema DDL (Member A)
// Run after Neo4j is healthy.

CREATE CONSTRAINT pod_name_namespace IF NOT EXISTS
FOR (p:Pod)
REQUIRE (p.name, p.namespace) IS UNIQUE;

CREATE INDEX pod_service_idx IF NOT EXISTS
FOR (p:Pod)
ON (p.service);

CREATE INDEX calls_last_seen_idx IF NOT EXISTS
FOR ()-[r:CALLS]-()
ON (r.last_seen);
