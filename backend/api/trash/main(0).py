import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.resolve()))

import numpy as np
from backend.api.assets.build_model import build_model_from_graph

""" from kaggle.api.kaggle_api_extended import KaggleApi """

import tensorflow as tf
import tensorflow.python.keras as k
from tensorflow.python.keras.callbacks import Callback
from tensorflow.python.keras.losses import mean_squared_error, MeanSquaredError, CategoricalCrossentropy

from tensorflow.python.keras.losses import MeanSquaredError, MeanAbsoluteError, MeanAbsolutePercentageError, MeanSquaredLogarithmicError, Huber, LogCosh, BinaryCrossentropy, CategoricalCrossentropy, SparseCategoricalCrossentropy, KLDivergence, Poisson, CosineSimilarity, Hinge
from tensorflow.python.keras.metrics import CategoricalAccuracy, Precision, Recall

import traceback
from backend.api.types.request_type import BuildModelRequest, GetModelArchitectureRequest, CompileModelRequest, FitModelRequest, PredictRequest, TrainStepRequest, Hyperparameters
import uvicorn
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import socketio
from typing import List, Dict
import os
import io
from dotenv import load_dotenv
from PIL import Image



from api.assets.tools import latent_vector_batch, duplicate_outputs, apply_scaling, apply_label_encoding, apply_math, batch_tensor, batch_inference
from keras.models import Model


