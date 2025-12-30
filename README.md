# Grain-Insight-Clifton

node version: v20.19.6

python version: v3.11

# Backend Setup (FastAPI)

This project uses **uv** for Python dependency management

### Install uv

Please install `uv` once before setting up the backend.

https://docs.astral.sh/uv/getting-started/installation/

### Install Backend Dependencies

After cloning the repository:

```
cd backend
uv sync
```

### Config interpretor

```
backend\.venv\Scripts\python.exe
```

### Run the Backend Server

This project starts the API by running the `main.py` file.

```
uv run python main.py
```

The API will be available at: http://localhost:8000

# Github Actions

Check frontend format

```
npm run format && npm run lint
```

Check python code format

```
uv run ruff check . --fix
uv run black .
```

# Frontend UI

This project uses [daisyUI](https://daisyui.com/) as a Tailwind CSS component library for building the frontend UI.

The default daisyUI theme is set to **corporate** for a clean and professional appearance.

# Database Switching Logic Explanation

This project automatically switches the database connection method based on the value of the `DEBUG` configuration:

## 1. When DEBUG=True

- Directly uses the `DATABASE_URL` configured in the `.env` file.
- Suitable for local development and testing environments.
- Example:
  ```env
  DATABASE_URL=sqlite:///./database.db
  DEBUG=True
  ```
- This will connect to a local SQLite database.

## 2. When DEBUG=False

- Ignores the `DATABASE_URL` in the `.env` file and dynamically constructs the PostgreSQL connection string using the following environment variables:
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_HOST`
  - `DB_PORT`
  - `DB_NAME`
- Suitable for production environments.
- This will connect to a remote PostgreSQL database.

## Code Snippet

Relevant logic in `core/config.py`:

```python
class Settings(BaseSettings):
    ...
    DATABASE_URL: str = None
    DEBUG: bool = False
    ...
    def __init__(self, **values):
        super().__init__(**values)
        if not self.DEBUG:
            db_user = os.getenv("DB_USER")
            db_password = os.getenv("DB_PASSWORD")
            db_host = os.getenv("DB_HOST")
            db_port = os.getenv("DB_PORT")
            db_name = os.getenv("DB_NAME")
            self.DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
```

---

To switch databases, simply modify the `DEBUG` and related variables in the `.env` file.

# DBeaver

DBeaver is a powerful database management and data visualization tool that supports various database types (such as SQLite, PostgreSQL, MySQL, etc.). We recommend using DBeaver for data visualization for the following reasons:

## 1. Download

https://dbeaver.io/download/

## 2. Connect to SQLite Database

![alt text](docs\images\image.png)

![alt text](docs\images\image-1.png)

![alt text](docs\images\image-2.png)

![alt text](docs\images\image-3.png)

## 3. Table Registration

When using SQLAlchemy to automatically create database tables, calling create_tables() will only create tables for model classes that have been registered with Base. Only if these models (such as `from models import user, job`) are imported in main.py or other executed files, can SQLAlchemy "discover" these models and register them with Base. Otherwise, even if create_tables() is called, the corresponding tables will not be created.

Therefore, be sure to import all model classes corresponding to the tables you need to create somewhere in your project (such as in `main.py` or a `router`). This ensures that create_tables() works properly and all tables are created as expected.
