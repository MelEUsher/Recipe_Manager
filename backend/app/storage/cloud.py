import logging
import re
from typing import Dict, Optional
from urllib.parse import ParseResult, parse_qsl, urlparse

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker

from .base import StorageBackend

logger = logging.getLogger(__name__)

_DIALECT_PATTERN = re.compile(r"^(postgresql|mysql)(?:\+[a-zA-Z0-9]+)?://")
_SUPPORTED_SCHEMES = {
    "postgresql",
    "postgresql+psycopg",
    "postgresql+psycopg2",
    "mysql",
    "mysql+pymysql",
}


class CloudStorage(StorageBackend):
    """
    Cloud database storage backend supporting PostgreSQL and MySQL.

    This backend connects to cloud-hosted or remote SQL databases that are served
    over the network. It is intended for production environments where connection
    pooling, reconnection helpers, and health checks are required.

    Supported database URLs:
        - postgresql://user:password@host:port/database
        - postgresql+psycopg://user:password@host:port/database
        - postgresql+psycopg2://user:password@host:port/database
        - mysql://user:password@host:port/database
        - mysql+pymysql://user:password@host:port/database

    Examples:
        storage = CloudStorage("postgresql://user:pass@db.example.com:5432/recipes")
        mysql_storage = CloudStorage("mysql+pymysql://team:secret@mysql.example.com:3306/recipes")

    Args:
        connection_string: SQLAlchemy connection URL that includes user,
            password, host, port, and database name.

    Raises:
        ValueError: If the provided connection string is missing or malformed.
    """

    def __init__(self, connection_string: str) -> None:
        """
        Initialize the cloud storage backend.

        Args:
            connection_string: SQLAlchemy database URL for PostgreSQL or MySQL.

        Raises:
            ValueError: If the connection string is invalid or lacks required parts.
        """
        self._validate_connection_string(connection_string)
        parsed: ParseResult = urlparse(connection_string)
        self._connect_args: Dict[str, str] = dict(parse_qsl(parsed.query))
        database = parsed.path.lstrip("/")

        if not database:
            raise ValueError("Connection string must include a database name.")

        scheme = parsed.scheme
        dialect = scheme.split("+", 1)[0]

        super().__init__(connection_string)
        self._engine: Optional[Engine] = None
        self._session_maker: Optional[sessionmaker] = None
        self._host = parsed.hostname or ""
        self._port = parsed.port
        self._database = database
        self._dialect = dialect
        self._connection_summary = f"{self._dialect}://{self._host}:{self._port}/{self._database}"
        logger.info("Configured CloudStorage for %s", self._connection_summary)

    def _validate_connection_string(self, connection_string: str) -> None:
        """
        Validate the cloud database connection string format.

        Args:
            connection_string: The SQLAlchemy URL to validate.

        Raises:
            ValueError: If the URL is invalid or missing required parts.
        """
        if not connection_string:
            raise ValueError("Connection string is required for CloudStorage.")

        if not _DIALECT_PATTERN.match(connection_string):
            raise ValueError(
                "Connection string must start with a supported scheme (postgresql:// or mysql://)."
            )

        parsed: ParseResult = urlparse(connection_string)

        if parsed.scheme not in _SUPPORTED_SCHEMES:
            raise ValueError(
                f"Unsupported database scheme '{parsed.scheme}'. "
                f"Supported schemes: {', '.join(sorted(_SUPPORTED_SCHEMES))}"
            )

        if not parsed.username:
            raise ValueError("Connection string must include a username.")

        if parsed.port is None:
            raise ValueError("Connection string must include a port number.")

        if not parsed.hostname:
            raise ValueError("Connection string must include a host.")

        if not parsed.path or parsed.path == "/":
            raise ValueError("Connection string must include a database name.")

    def get_engine(self) -> Engine:
        """Return the SQLAlchemy engine configured for cloud databases."""
        if self._engine is None:
            try:
                self._engine = create_engine(
                    self.database_url,
                    pool_size=5,
                    max_overflow=10,
                    pool_timeout=30,
                    pool_recycle=3600,
                    pool_pre_ping=True,
                    echo=False,
                    connect_args=self._connect_args,
                )
                self.is_connected = True
                logger.info("Created cloud engine for %s", self._connection_summary)
            except SQLAlchemyError as exc:
                logger.error("Failed to create cloud engine for %s: %s", self._connection_summary, exc)
                raise

        return self._engine

    def get_session_maker(self) -> sessionmaker:
        """Return a cached sessionmaker bound to the cloud engine."""
        if self._session_maker is None:
            engine = self.get_engine()
            self._session_maker = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=engine,
            )
        return self._session_maker

    def create_session(self) -> Session:
        """Create and return a new Session."""
        try:
            session_factory = self.get_session_maker()
            return session_factory()
        except SQLAlchemyError as exc:
            logger.error("Failed to create cloud session for %s: %s", self._connection_summary, exc)
            raise

    def close(self) -> None:
        """Dispose the cloud engine and release pooled connections."""
        if self._engine is not None:
            try:
                self._engine.dispose()
                logger.info("Disposed cloud engine for %s", self._connection_summary)
            except SQLAlchemyError as exc:
                logger.error("Error disposing cloud engine for %s: %s", self._connection_summary, exc)

        self._engine = None
        self._session_maker = None
        self.is_connected = False

    def initialize(self) -> None:
        """Ensure the models schema exists in the cloud database."""
        engine = self.get_engine()
        if not self.health_check():
            raise ConnectionError("Unable to reach the cloud database for initialization.")

        try:
            from backend.app.models import Base

            Base.metadata.create_all(bind=engine)
            logger.info("Initialized cloud schema for %s", self._connection_summary)
        except SQLAlchemyError as exc:
            logger.error("Failed to initialize cloud schema for %s: %s", self._connection_summary, exc)
            raise

    def health_check(self) -> bool:
        """Verify that the cloud database responds to a lightweight query."""
        try:
            engine = self.get_engine()
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return True
        except (OperationalError, SQLAlchemyError) as exc:
            logger.error("Cloud health check failed for %s: %s", self._connection_summary, exc)
            return False
