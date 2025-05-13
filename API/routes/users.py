from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from models.user import UserResponse, LoginRequest
from models.db_models import User
from database import get_db
from typing import List
from auth import create_access_token, authenticate_user_db
from auth import get_current_user, require_parent_from_token, get_token_header

router = APIRouter()

# LOGIN
@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user_db(db, request.username, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id, "role": user.role}

# OBTENER TODOS LOS USUARIOS - SOLO PADRE
@router.get("/get", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), user=Depends(require_parent_from_token)):
    users = db.query(User).all()
    return users

# OBTENER USUARIO POR ID - PROPIO O PADRE
@router.get("/get/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Verificar permisos
    if current_user.role != "parent" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para acceder a estos datos")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return user

# RESETEAR DINERO -  PADRE
@router.put("/reset/{user_id}")
def reset_user(user_id: int, db: Session = Depends(get_db), user=Depends(require_parent_from_token)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db_user.amount = 0
    db.commit()
    return {"status": 1, "message": "Dinero reseteado correctamente."}