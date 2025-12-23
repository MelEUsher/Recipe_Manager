from abc import ABC, abstractmethod

from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker


class StorageBackend(ABC):
    """
    Abstract base class that defines the storage contract for the backend.

    All concrete storage implementations (SQLite, PostgreSQL, cloud services, etc.)
    inherit from this class and override each abstract method so the rest of the
    application can rely on a stable API regardless of the chosen storage provider.

    Example:

        class MySQLiteStorage(StorageBackend):
            def __init__(self, database_url: str) -> None:
                super().__init__(database_url)

            def get_engine(self) -> Engine:
                return create_engine(self.database_url, connect_args={...})

    """

    database_url: str
    is_connected: bool

    def __init__(self, database_url: str) -> None:
        """
        Initialize the storage backend with its connection string.

        Args:
            database_url: Connection URL that concrete subclasses should validate
                and use when creating engines and sessions.
        """
        self.database_url = database_url
        self.is_connected = False

    @abstractmethod
    def get_engine(self) -> Engine:
        """
        Retrieve the SQLAlchemy engine instance for this backend.

        Returns:
            Engine: The engine configured with the backend's connection parameters.

        Raises:
            sqlalchemy.exc.SQLAlchemyError: If the engine cannot be configured.
        """
        ...

    @abstractmethod
    def get_session_maker(self) -> sessionmaker:
        """
        Provide the sessionmaker factory tied to the backend engine.

        Returns:
            sessionmaker: Factory that will create `Session` objects bound to this engine.
        """
        ...

    @abstractmethod
    def create_session(self) -> Session:
        """
        Create and return a new SQLAlchemy session.

        Returns:
            Session: A fresh session for transactional work.

        Raises:
            sqlalchemy.exc.SQLAlchemyError: If a session fails to start.
        """
        ...

    @abstractmethod
    def close(self) -> None:
        """
        Close any open connections or resources held by the backend.

        Implementations should update the `is_connected` flag and release pools or
        clients as needed.
        """
        ...

    @abstractmethod
    def initialize(self) -> None:
        """
        Perform storage-specific initialization such as creating tables.

        Implementations may use Alembic, metadata creation, or other provisioning
        logic that needs to run before the backend accepts traffic.
        """
        ...

    @abstractmethod
    def health_check(self) -> bool:
        """
        Verify the backend is reachable and ready for requests.

        Returns:
            bool: True if the backend is healthy, False otherwise.
        """
        ...
