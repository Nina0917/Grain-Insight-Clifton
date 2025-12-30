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

# Run Seeder

```
cd backend
python -m db.seeders.seed_all
```

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

This project uses [daisyUI](https://daisyui.com/)

The default daisyUI theme is set to **corporate**

# Database Switching Logic Explanation

This project switches the database connection method based on the value of the `DEBUG` configuration:

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

Relevant logic is in `core/config.py`

---

To switch databases, simply modify the `DEBUG` and related variables in the `.env` file.

# DBeaver

DBeaver supports various database types (such as SQLite, PostgreSQL, MySQL, etc.).

## 1. Download

https://dbeaver.io/download/

## 2. Connect to SQLite Database

![alt text](docs/images/image.png)

![alt text](docs/images/image-1.png)

![alt text](docs/images/image-2.png)

![alt text](docs/images/image-3.png)

## 3. Table Registration

When using SQLAlchemy to automatically create database tables, calling create_tables() will only create tables for model classes that have been registered with Base. Only if these models (such as `from models import user, job`) are imported in main.py or other executed files, can SQLAlchemy "discover" these models and register them with Base. Otherwise, even if create_tables() is called, the corresponding tables will not be created.

Therefore, be sure to import all model classes corresponding to the tables you need to create somewhere in your project (such as in `main.py` or a `router`). This ensures that create_tables() works properly and all tables are created as expected.
