import asyncio
import json
import uuid
from redis_client import get_redis

STREAM = "anomalies:cpu"
GROUP = "incident-group"
CONSUMER = "incident-generator-1"


async def setup(r):
    try:
        await r.xgroup_create(STREAM, GROUP, id="$", mkstream=True)
    except:
        pass


def classify_severity(z_score):
    if z_score >= 4:
        return "critical"
    return "warning"


async def run():
    r = get_redis()
    await setup(r)

    print("🚀 Incident Generator Started...")
    print("Waiting for anomaly...")
    while True:
        resp = await r.xreadgroup(
            GROUP,
            CONSUMER,
            streams={STREAM: ">"},
            count=10,
            block=5000
        )

        if not resp:
            continue

        for _, messages in resp:
            for msg_id, data in messages:
                payload = json.loads(data["data"])

                print("📥 Anomaly Received:", payload)

                severity = classify_severity(payload["z_score"])

                incident = {
                    "id": str(uuid.uuid4()),
                    "severity": severity,
                    "confidence": round(min(payload["z_score"] / 5, 1), 2),
                    "primary_pod": {
                        "namespace": "default",
                        "name": payload["pod"]
                    },
                    "summary": "High CPU anomaly detected"
                }

                await r.xadd(
                    f"incidents:{severity}",
                    {"data": json.dumps(incident)},
                    maxlen=1000
                )

                print("🚨 INCIDENT CREATED:", incident)

                await r.xack(STREAM, GROUP, msg_id)


if __name__ == "__main__":
    asyncio.run(run())