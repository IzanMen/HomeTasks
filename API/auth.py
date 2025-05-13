from fastapi import HTTPException, Header, Depends
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from sqlalchemy.orm import Session
from database import get_db
from models.db_models import User
from dotenv import load_dotenv
import os

# CLAVE SECRETA, ALGORITMO Y TIEMPO DE EXPIRACIÓN DEL TOKEN
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

# CONFIGURACIÓN PARA HASHING CONTRASEÑAS
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# FUNCIÓN PARA VERIFICAR LA CONTRASEÑA
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# FUNCIÓN PARA HASHEAR LA CONTRASEÑA
def get_password_hash(password):
    return pwd_context.hash(password)

# FUNCIÓN PARA AUTENTICAR AL USUARIO CON DB
def authenticate_user_db(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if user and verify_password(password, user.password):
        return user
    return None

# FUNCIÓN PARA CREAR UN TOKEN DE ACCESO
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# FUNCIÓN PARA OBTENER EL TOKEN DEL HEADER
def get_token_header(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Encabezado de autorización inválido o ausente")
    return authorization.split(" ")[1]

# OBTENER EL USUARIO ACTUAL A PARTIR DEL TOKEN
def get_current_user(token: str = Depends(get_token_header), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        
        return user
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido o mal formado")

# FUNCIÓN PARA VERIFICAR SI EL USUARIO ES PARENT
def require_parent_from_token(user=Depends(get_current_user)):
    if user.role != "parent":
        raise HTTPException(status_code=403, detail="Acceso restringido a padres")
    return user

# FUNCIÓN PARA VERIFICAR SI EL USUARIO ES OWNER O PARENT
def require_owner_or_parent_from_token(user_id: int, user=Depends(get_current_user)):
    if user.role == "parent":
        return user
    if user.role == "child" and user.id == user_id:
        return user
    raise HTTPException(status_code=403, detail="No tienes permiso para acceder a estos datos")