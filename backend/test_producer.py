import asyncio
import json
import time
from redis_client import get_redis

async def produce():
    r = get_redis()

    while True:
        data = {
            "timestamp": time.time(),
            "namespace": "default",
            "pod": "web-pod",
            # alternating values to create spikes
            "value": 0.2 if int(time.time()) % 5 else 0.95
        }

        await r.xadd(
            "metrics:default:web-pod:cpu",
            {"data": json.dumps(data)},
            maxlen=1000
        )

        print("Produced:", data)
        await asyncio.sleep(2)

if __name__ == "__main__":
    asyncio.run(produce())