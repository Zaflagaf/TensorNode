from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.background import BackgroundTasks
from fastapi.responses import FileResponse
from typing import List
from PIL import Image
import io, tensorflow as tf
from pathlib import Path

from backend.core.caches import cache
from backend.types.request_type import DownloadModel

router = APIRouter()


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
        raise HTTPException(status_code=404, detail=f"'{model_name}' must be created before downloading.")

    model = cache.blank_models[model_id]
    model_path = Path(f"{model_name}(blank).keras")
    
    model.save(model_path)
    
    background_tasks.add_task(lambda: model_path.unlink())

    return FileResponse(
        path=model_path,
        media_type="application/octet-stream",
        filename=f"{model_name}(blank).keras"
    )


@router.post("/download-trained-model")
def download_trained_model(data: DownloadModel, background_tasks: BackgroundTasks):
    model_id = data.modelId
    model_name = data.modelName

    if model_id not in cache.trained_models:
        raise HTTPException(status_code=404, detail=f"'{model_name}' must be trained before downloading.")

    model = cache.trained_models[model_id]
    model_path = Path(f"{model_name}(trained).keras")

    model.save(model_path)
 
    background_tasks.add_task(lambda: model_path.unlink())

    return FileResponse(
        path=model_path,
        media_type="application/octet-stream",
        filename=f"{model_name}(trained).keras"
    )