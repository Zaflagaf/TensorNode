from pydantic import BaseModel
from typing import List, Dict

class BuildModelRequest(BaseModel):
    id: str
    nodes: Dict
    edges: Dict

class GetModelArchitectureRequest(BaseModel):
    id: str

class CompileModelRequest(BaseModel):
    id: str
    optimizer: str
    loss: str
    metrics: List[str]
    
class FitModelRequest(BaseModel):
    id: str
    features: List
    labels: List
    epochs: int
    batchSize: int

class PredictRequest(BaseModel):
    id: str
    features: List
