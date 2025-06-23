from pydantic import BaseModel
from typing import Optional

# Modelo para login
class LoginRequest(BaseModel):
    username: str
    password: str

# Modelo para la base de datos (contiene la contraseña)
class UserInDB(BaseModel):
    id: int
    username: str
    email: str
    amount: float = 0
    password: str
    role: str
    phone: Optional[str] = None

# Modelo para la respuesta (sin la contraseña)
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    amount: float = 0
    phone: Optional[str] = None

# Modelo para actualizar teléfono
class UpdatePhoneRequest(BaseModel):
    phone: str