import logging
import os
from pathlib import Path
from typing import Optional

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from .base import StorageBackend

logger = logging.getLogger(__name__)


class LocalStorage(StorageBackend):
    """
    SQLite-backed local storage implementation.

    This backend stores data inside a single SQLite file and is intended for
    local-only deployments or single-user scenarios where a lightweight embedded
    database is sufficient.

    Args:
        db_path: Path where the SQLite database file will be stored. The path is
            expanded and converted to an absolute location before use.

    Example:
        storage = LocalStorage(db_path="./data/recipe_manager.db")
        storage.initialize()
        session = storage.create_session()
    """

    def __init__(self, db_path: str = "./data/recipe_manager.db") -> None:
        """
        Prepare the filesystem path and setup internal state.

        Args:
            db_path: Relative or absolute path to the SQLite database file.
        """
        resolved_path = Path(db_path).expanduser().resolve()
        directory = resolved_path.parent

        try:
            os.makedirs(directory, exist_ok=True)
            logger.info("Ensured SQLite directory exists at %s", directory)
        except OSError as exc:
            logger.error(
                "Unable to create directory %s for SQLite storage: %s", directory, exc
            )
            raise

        database_url = f"sqlite:///{resolved_path.as_posix()}"
        super().__init__(database_url)
        self.db_path = resolved_path
        self._engine: Optional[Engine] = None
        self._session_maker: Optional[sessionmaker] = None
        logger.info("LocalStorage configured with database file %s", self.db_path)

    def get_engine(self) -> Engine:
        """Return the cached SQLAlchemy engine, creating it if needed."""
        if self._engine is None:
            try:
                self._engine = create_engine(
                    self.database_url,
                    connect_args={"check_same_thread": False},
                    pool_pre_ping=True,
                    echo=False,
                )
                self.is_connected = True
                logger.info("Created SQLite engine for %s", self.database_url)
            except SQLAlchemyError as exc:
                logger.error("Failed to create SQLite engine: %s", exc)
                raise

        return self._engine

    def get_session_maker(self) -> sessionmaker:
        """Return a sessionmaker bound to the SQLite engine."""
        if self._session_maker is None:
            engine = self.get_engine()
            self._session_maker = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=engine,
            )

        return self._session_maker

    def create_session(self) -> Session:
        """Create and return a new SQLAlchemy session for transactional work."""
        try:
            session_factory = self.get_session_maker()
            return session_factory()
        except SQLAlchemyError as exc:
            logger.error("Failed to create SQLite session: %s", exc)
            raise

    def close(self) -> None:
        """Dispose the SQLite engine and reset internal connection state."""
        if self._engine is not None:
            try:
                self._engine.dispose()
                logger.info("Disposed SQLite engine for %s", self.database_url)
            except SQLAlchemyError as exc:
                logger.error("Error disposing SQLite engine: %s", exc)

        self._engine = None
        self._session_maker = None
        self.is_connected = False

    def initialize(self) -> None:
        """Create all database tables defined by the application's Base metadata."""
        try:
            engine = self.get_engine()
            from app.models import Base

            Base.metadata.create_all(bind=engine)
            logger.info("Initialized SQLite schema at %s", self.db_path)
        except SQLAlchemyError as exc:
            logger.error("Failed to initialize SQLite schema: %s", exc)
            raise

    def health_check(self) -> bool:
        """Verify the SQLite connection by executing a lightweight query."""
        try:
            engine = self.get_engine()
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return True
        except SQLAlchemyError as exc:
            logger.error("SQLite health check failed: %s", exc)
            return False
