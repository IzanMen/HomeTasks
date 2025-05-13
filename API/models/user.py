from pydantic import BaseModel

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

# Modelo para la respuesta (sin la contraseña)
class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    amount: float = 0