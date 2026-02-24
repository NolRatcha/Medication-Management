from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

POSTGRES_URL = "postgresql+asyncpg://clinic_user:clinic_password@localhost:5432/clinic_db"

engine = create_async_engine(POSTGRES_URL, echo=True)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

MONGO_URL = "mongodb://admin:adminpassword@localhost:27017"
MONGO_DB_NAME = "clinic_db_mongo"

mongo_client: AsyncIOMotorClient = None

async def connect_mongodb(document_models: list):
    global mongo_client
    mongo_client = AsyncIOMotorClient(MONGO_URL)
    await init_beanie(
        database=mongo_client[MONGO_DB_NAME],
        document_models=document_models
    )
    print("✅ MongoDB Connected!")

async def disconnect_mongodb():
    global mongo_client
    if mongo_client:
        mongo_client.close()
        print("🛑 MongoDB Disconnected!")
