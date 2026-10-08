import time
import logging
import asyncio
from typing import Optional, Dict, Any, List
import redis.asyncio as aioredis
from backend.core.config import settings

logger = logging.getLogger(__name__)

class InMemoryRedisMock:
    """High-reliability in-memory fallback mimicking Redis atomic operations and TTLs."""
    def __init__(self):
        self._store: Dict[str, Any] = {}
        self._expires: Dict[str, float] = {}
        self._lists: Dict[str, List[str]] = {}
        self._lock = asyncio.Lock()

    def _purge_expired(self, key: str):
        if key in self._expires and time.time() > self._expires[key]:
            self._store.pop(key, None)
            self._expires.pop(key, None)

    async def get(self, key: str) -> Optional[str]:
        async with self._lock:
            self._purge_expired(key)
            val = self._store.get(key)
            return str(val) if val is not None else None

    async def set(self, key: str, value: Any, ex: Optional[int] = None, nx: bool = False) -> bool:
        async with self._lock:
            self._purge_expired(key)
            if nx and key in self._store:
                return False
            self._store[key] = str(value)
            if ex:
                self._expires[key] = time.time() + ex
            else:
                self._expires.pop(key, None)
            return True

    async def delete(self, *keys: str) -> int:
        async with self._lock:
            count = 0
            for k in keys:
                if k in self._store:
                    del self._store[k]
                    self._expires.pop(k, None)
                    count += 1
            return count

    async def rpush(self, key: str, *values: str) -> int:
        async with self._lock:
            if key not in self._lists:
                self._lists[key] = []
            self._lists[key].extend([str(v) for v in values])
            return len(self._lists[key])

    async def lrange(self, key: str, start: int, end: int) -> List[str]:
        async with self._lock:
            lst = self._lists.get(key, [])
            if end == -1:
                return lst[start:]
            return lst[start:end + 1]

    async def ping(self) -> bool:
        return True

    async def close(self):
        pass


class RedisClientWrapper:
    """Wrapper that tries live Redis and falls back cleanly to the memory store if unreachable."""
    def __init__(self):
        self._client = None
        self._mock = InMemoryRedisMock()
        self._is_live = False

    async def get_client(self):
        if self._client is not None:
            return self._client

        try:
            client = aioredis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_timeout=1.5,
                socket_connect_timeout=1.5
            )
            await client.ping()
            self._client = client
            self._is_live = True
            logger.info("Connected to live Redis at %s", settings.REDIS_URL)
            return self._client
        except Exception as e:
            logger.warning("Live Redis unavailable (%s). Activating atomic in-memory Redis provider.", e)
            self._client = self._mock
            self._is_live = False
            return self._client

    @property
    def is_live(self) -> bool:
        return self._is_live

redis_wrapper = RedisClientWrapper()

async def get_redis():
    """FastAPI dependency for accessing the Redis client."""
    return await redis_wrapper.get_client()
