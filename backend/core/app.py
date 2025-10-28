from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List

def create_app(cors_origins: List[str] = ["*"]) -> FastAPI:
    app = FastAPI(
        title="Tensornode Backend API",
        description="Backend API pour construction, entraînement et inférence de modèles Tensorflow",
        version="3.1.0"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

    return app

