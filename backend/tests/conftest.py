import os
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

# Ensure the application uses an isolated database for testing only.
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "sqlite:///./test.db")
os.environ["DATABASE_URL"] = TEST_DATABASE_URL

from app.database import Base, engine, get_db  # noqa: E402
from app.main import app  # noqa: E402

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if TEST_DATABASE_URL.startswith("sqlite:///"):
        db_path = TEST_DATABASE_URL.replace("sqlite:///", "")
        if db_path and os.path.exists(db_path):
            try:
                os.remove(db_path)
            except OSError:
                pass


@pytest.fixture(autouse=True)
def clean_database():
    yield
    with engine.begin() as connection:
        for table in reversed(Base.metadata.sorted_tables):
            connection.execute(table.delete())


@pytest.fixture()
def db_session() -> Generator:
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
