import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.core.config import settings
from backend.core.database import engine, Base
from backend.core.redis_client import get_redis
from backend.routers.checkout import router as checkout_router
from backend.routers.orders import router as orders_router
from backend.routers.inventory import router as inventory_router
from backend.routers.webhooks import router as webhooks_router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("1aa.oms")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing 1AA Enterprise OMS Platform...")
    # Create tables if using SQLite/local dev; PostgreSQL typically utilizes migrations
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schemas verified.")
    
    # Check Redis connectivity
    redis = await get_redis()
    await redis.ping()
    logger.info("Redis concurrency lock service online.")
    
    yield
    
    logger.info("Shutting down OMS background workers...")
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Enterprise-grade Order Management System (OMS), Concurrency Inventory Reservation, "
        "and 3PL Logistics Webhook Engine for 1AA Wholesale & Direct Factory Dispatch."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enterprise CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(checkout_router, prefix=settings.API_V1_STR)
app.include_router(orders_router, prefix=settings.API_V1_STR)
app.include_router(inventory_router, prefix=settings.API_V1_STR)
app.include_router(webhooks_router)

@app.get("/health", tags=["Platform Health"])
async def platform_health_check():
    """Returns platform operational readiness metrics."""
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "dispatch_facility": f"Mysore Hub ({settings.CENTRAL_DISPATCH_PINCODE})",
        "support_hotline": settings.OWNER_PHONE
    }

@app.get("/", tags=["Platform Root"])
async def platform_root():
    return {
        "message": "Welcome to 1AA Enterprise OMS API",
        "documentation": "/docs",
        "version": settings.VERSION
    }
