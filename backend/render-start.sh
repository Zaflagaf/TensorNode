#!/usr/bin/env bash

# Lancer ton app FastAPI avec Uvicorn
uvicorn api.main:sio_app --host 0.0.0.0 --port $PORT