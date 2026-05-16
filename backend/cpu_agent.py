import asyncio
import json
import statistics
from collections import defaultdict, deque
from redis_client import get_redis

STREAM = "metrics:default:web-pod:cpu"
GROUP = "cpu-agents"
CONSUMER = "cpu-agent-1"

WINDOW = 20
THRESHOLD = 1

windows = defaultdict(lambda: deque(maxlen=WINDOW))


async def setup(r):
    try:
        await r.xgroup_create(STREAM, GROUP, id="$", mkstream=True)
    except:
        pass


def z_score(values, new):
    if len(values) < 5:
        values.append(new)
        return 0

    mean = statistics.mean(values)
    std = statistics.pstdev(values)
    if std < 0.01:
        std = 0.01
    z = min(z, 10)    
    z = abs(new - mean) / std
    values.append(new)

    return z


async def run():
    r = get_redis()
    await setup(r)

    print("🚀 CPU Agent Started...")

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

                print("📥 Received:", payload)

                pod = payload["pod"]
                value = payload["value"]

                z = z_score(windows[pod], value)

                print("Z-score:", z)

                if z >= THRESHOLD:
                    anomaly = {
                        "type": "cpu",
                        "pod": pod,
                        "value": value,
                        "z_score": z
                    }

                    await r.xadd(
                        "anomalies:cpu",
                        {"data": json.dumps(anomaly)},
                        maxlen=1000
                    )

                    print("🔥 ANOMALY:", anomaly)
                    print("📥 Received:", payload)
                    print("Z-score:", z)

                await r.xack(STREAM, GROUP, msg_id)


if __name__ == "__main__":
    asyncio.run(run())