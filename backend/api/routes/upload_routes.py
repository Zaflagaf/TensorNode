from fastapi import APIRouter, UploadFile, File, Query
from fastapi.responses import FileResponse
from typing import List
from PIL import Image
import io, tensorflow as tf

from api.core.caches import cache

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

@router.get("/download-blank-model")
def download_model(model_id: str = Query(...)):
    model_path = "model_to_download.h5"
    model = cache.blank_models[model_id]
    model.save(model_path)
    return FileResponse(model_path, media_type="application/octet-stream", filename="model.h5")

@router.get("/download-trained-model")
def download_model(model_id: str = Query(...)):
    model_path = "model_to_download.h5"
    model = cache.trained_models[model_id]
    model.save(model_path)
    return FileResponse(model_path, media_type="application/octet-stream", filename="model.h5")