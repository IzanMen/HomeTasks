from pydantic import BaseModel

class TaskUser(BaseModel):
    task_id: int
    user_id: int
    status: str = "PENDIENTE"