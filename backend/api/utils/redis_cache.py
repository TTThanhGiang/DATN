import json
from api.utils.redis_client import redis_client

def lay_cache(key):
    data = redis_client.get(key)
    return json.loads(data) if data else None

def luu_cache(key, value, ttl=300):
    redis_client.setex(key, ttl, json.dumps(value, default=str))

def xoa_cache_theo_pattern(pattern):
    for key in redis_client.scan_iter(match=pattern):
        redis_client.delete(key)
