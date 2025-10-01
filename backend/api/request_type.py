from pydantic import BaseModel


class BuildModelRequest(BaseModel):
    id: str
    nodes: dict
    edges: dict

class GetModelArchitectureRequest(BaseModel):
    id: str

class CompileModelRequest(BaseModel):
    id: str
    optimizer: str
    loss: str
    metrics: list[str]
    
class FitModelRequest(BaseModel):
    id: str
    features: list
    labels: list
    epochs: int
    batchSize: int


class PredictRequest(BaseModel):
    id: str
    features: list
