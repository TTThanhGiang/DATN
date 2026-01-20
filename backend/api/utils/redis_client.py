import os
import redis

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

redis_client = redis.from_url(
    os.getenv("REDIS_URL"),
    decode_responses=True
)

