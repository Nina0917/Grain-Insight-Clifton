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
uv run ruff check .
uv run black .
```

# Frontend UI

This project uses [daisyUI](https://daisyui.com/) as a Tailwind CSS component library for building the frontend UI.

The default daisyUI theme is set to **corporate** for a clean and professional appearance.
