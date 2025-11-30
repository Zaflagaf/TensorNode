from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.background import BackgroundTasks
from fastapi.responses import FileResponse
from typing import List
from PIL import Image
import io, tensorflow as tf
from pathlib import Path
import os
import base64

from backend.core.caches import cache
from backend.types.request_type import DownloadModel
from backend.types.request_type import SpecifyCSVColumn

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "temp")

@router.post("/specify_csv_column")
async def specify_csv_col(data: SpecifyCSVColumn):
    file_name = data.fileName
    columns_type = data.columnsType
    cache.hodgepodge["columns_type"][file_name] = columns_type


@router.post("/upload_csv")
async def upload_csv_chunk(
    file: UploadFile,
    index: int = Form(...),
    totalChunks: int = Form(...)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    if index == 0 and os.path.exists(file_path):
        os.remove(file_path)

    content = await file.read()

    if index > 0 and file.filename.endswith(".csv"):
        lines = content.split(b"\n")
        if len(lines) > 1:
            content = b"\n".join(lines[1:])

    with open(file_path, "ab") as f:
        f.write(content)

    cache.file_paths[file.filename] = file_path

    return {
        "data": None,
        "message": f"Chunk {index} from {file.filename} uploaded in its entirety",
        "status": "success",
    }

@router.post('/upload_images')
async def upload_images(images: List[UploadFile] = File(...)):
    uploaded = []

    for img_file in images:
        # Si déjà en cache, on skip
        if img_file.filename in cache.images:
            uploaded.append(img_file.filename)
            continue

        contents = await img_file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image = image.convert("L")
        image = image.resize((64, 64))

        # Convertir en tenseur
        tensor = tf.keras.preprocessing.image.img_to_array(image)
        tensor = tf.convert_to_tensor(tensor, dtype=tf.float32) / 255.0

        # Stocker dans le cache
        cache.images[img_file.filename] = tensor
        uploaded.append(img_file.filename)

    return {
        "status": "success",
    }

@router.post("/download-blank-model")
def download_blank_model(data: DownloadModel, background_tasks: BackgroundTasks):
    model_id = data.modelId
    model_name = data.modelName

    if model_id not in cache.blank_models:
        print("error")
        return {
            "data": None,
            "message": f"'{model_name}' has not yet been built.",
            "status": "error"
        }

    model = cache.blank_models[model_id]
    model_path = Path(f"{model_name}(blank).keras")
    
    model.save(model_path)

    # Lire le fichier et encoder en base64
    with open(model_path, "rb") as f:
        encoded_file = base64.b64encode(f.read()).decode("utf-8")

    # Supprimer le fichier après
    background_tasks.add_task(lambda: model_path.unlink())

    print("success")
    return {
        "data": {"encoded_file": encoded_file},
        "message": f"Model '{model_name}' downloaded",
        "status": "success"
    }


@router.post("/download-trained-model")
def download_trained_model(data: DownloadModel, background_tasks: BackgroundTasks):
    model_id = data.modelId
    model_name = data.modelName

    if model_id not in cache.trained_models:
        print("error")
        return {
            "data": None,
            "message": f"'{model_name}' must be trained before downloading.",
            "status": "error"
        }

    model = cache.trained_models[model_id]
    model_path = Path(f"{model_name}(trained).keras")
    
    model.save(model_path)

    # Lire le fichier et encoder en base64
    with open(model_path, "rb") as f:
        encoded_file = base64.b64encode(f.read()).decode("utf-8")

    # Supprimer le fichier après
    background_tasks.add_task(lambda: model_path.unlink())

    print("success")
    return {
        "data": {"encoded_file": encoded_file},
        "message": f"Model '{model_name}' downloaded",
        "status": "success"
    }