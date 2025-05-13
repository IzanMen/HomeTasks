from fastapi import APIRouter, Path, Body, HTTPException, status, Depends
from sqlalchemy.orm import Session
from models.task import Task as TaskSchema
from models.task_user import TaskUser as TaskUserSchema
from models.db_models import Task, TaskUser, User
from database import get_db
from typing import Optional, List
from auth import get_current_user, require_parent_from_token

router = APIRouter()

# GET TODAS LAS TAREAS - SOLO PADRE
@router.get("/get")
def get_tasks(db: Session = Depends(get_db), user=Depends(require_parent_from_token)):
    tasks = db.query(Task).all()
    return {"status": 1, "tasks": tasks}

# CREAR NUEVA TAREA - SOLO PADRE
@router.post("/create")
def create_task(task: TaskSchema, db: Session = Depends(get_db), user=Depends(require_parent_from_token)):
    # Verificar si ya existe una tarea con el mismo ID
    existing_task = db.query(Task).filter(Task.id == task.id).first()
    if existing_task:
        raise HTTPException(status_code=400, detail={"status": 0, "message": "Ya existe una tarea con ese ID."})
    
    db_task = Task(
        id=task.id,
        title=task.title,
        description=task.description,
        reward=task.reward
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return {"status": 1, "message": "Tarea creada correctamente."}

# MODIFICAR TAREA - SOLO PADRE
@router.put("/update/{task_id}")
def update_task(
    task_id: int = Path(...),
    new_title: Optional[str] = Body(None),
    new_description: Optional[str] = Body(None),
    new_reward: Optional[float] = Body(None),
    db: Session = Depends(get_db),
    user=Depends(require_parent_from_token)
):
    if new_title is None and new_description is None and new_reward is None:
        raise HTTPException(status_code=400, detail={"status": 0, "message": "No se ha especificado ninguna propiedad a actualizar."})

    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail={"status": 0, "message": "No se encontró la tarea con ese ID."})
    
    if new_title is not None:
        task.title = new_title
    if new_description is not None:
        task.description = new_description
    if new_reward is not None:
        task.reward = new_reward
    
    db.commit()
    db.refresh(task)
    
    return {
        "status": 1,
        "message": "Tarea actualizada correctamente.",
        "updated_task": task
    }

# ASIGNAR TAREA - SOLO PADRE
@router.post("/assign")
def assign_task(task_user: TaskUserSchema, db: Session = Depends(get_db), user=Depends(require_parent_from_token)):
    # Verificar que existe la tarea y el usuario
    task = db.query(Task).filter(Task.id == task_user.task_id).first()
    db_user = db.query(User).filter(User.id == task_user.user_id).first()
    
    if not task:
        raise HTTPException(status_code=404, detail={"status": 0, "message": "No se encontró la tarea con ese ID."})
    
    if not db_user:
        raise HTTPException(status_code=404, detail={"status": 0, "message": "No se encontró el usuario con ese ID."})
    
    # Verificar si ya está asignada
    existing = db.query(TaskUser).filter(
        TaskUser.task_id == task_user.task_id,
        TaskUser.user_id == task_user.user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail={"status": 0, "message": "Esta tarea ya está asignada a este usuario."})
    
    db_task_user = TaskUser(
        task_id=task_user.task_id,
        user_id=task_user.user_id,
        status=task_user.status
    )
    db.add(db_task_user)
    db.commit()
    
    return {"status": 1, "message": "Tarea asignada correctamente."}

# DESASIGNAR TAREA - SOLO PADRE
@router.post("/unassign")
def unassign_task(task_user: TaskUserSchema, db: Session = Depends(get_db), user=Depends(require_parent_from_token)):
    relation = db.query(TaskUser).filter(
        TaskUser.task_id == task_user.task_id,
        TaskUser.user_id == task_user.user_id
    ).first()
    
    if not relation:
        raise HTTPException(status_code=404, detail={"status": 0, "message": "No se encontró la relación entre la tarea y el usuario."})
    
    db.delete(relation)
    db.commit()
    return {"status": 1, "message": "Tarea desasignada correctamente."}

# OBTENER TAREAS DE UN USUARIO - HIJO SOLO LAS SUYAS, PADRE CUALQUIERA
@router.get("/assigned/{user_id}")
def get_assigned_tasks(user_id: int = Path(...), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Verificar permisos
    if current_user.role != "parent" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail={"status": 0, "message": "No tienes permiso para ver estas tareas."})
    
    # Consulta que une TaskUser con Task para obtener los detalles de la tarea
    tasks = db.query(Task, TaskUser.status).join(TaskUser).filter(TaskUser.user_id == user_id).all()
    
    if not tasks:
        return {"status": 1, "tasks": []}
    
    assigned_tasks = [
        {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "reward": task.reward,
            "status": status
        } for task, status in tasks
    ]
    
    return {"status": 1, "tasks": assigned_tasks}

# COMPLETAR TAREA - SOLO EL PROPIETARIO (HIJO) O PADRE
@router.put("/complete")
def complete_task(task_user: TaskUserSchema, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "parent" and task_user.user_id != current_user.id:
        raise HTTPException(status_code=403, detail={"status": 0, "message": "No tienes permiso para completar esta tarea."})
    
    relation = db.query(TaskUser).filter(
        TaskUser.task_id == task_user.task_id,
        TaskUser.user_id == task_user.user_id
    ).first()
    
    if not relation:
        raise HTTPException(status_code=404, detail={"status": 0, "message": "No se encontró la relación entre la tarea y el usuario."})
    
    relation.status = "COMPLETADA"
    db.commit()
    return {"status": 1, "message": "Tarea marcada como completada."}

# CONFIRMAR TAREA - SOLO PADRE
@router.put("/complete-confirm")
def confirm_task(task_user: TaskUserSchema, db: Session = Depends(get_db), user=Depends(require_parent_from_token)):
    relation = db.query(TaskUser).filter(
        TaskUser.task_id == task_user.task_id,
        TaskUser.user_id == task_user.user_id
    ).first()
    
    if not relation:
        raise HTTPException(status_code=404, detail={"status": 0, "message": "No se encontró la relación entre la tarea y el usuario."})
    
    if relation.status.upper() != "COMPLETADA":
        raise HTTPException(status_code=400, detail={"status": 0, "message": "La tarea aún no está completada. No se puede confirmar."})
    
    # Obtener la recompensa de la tarea
    task = db.query(Task).filter(Task.id == task_user.task_id).first()
    reward = task.reward
    
    # Actualizar el saldo del usuario
    db_user = db.query(User).filter(User.id == task_user.user_id).first()
    db_user.amount += reward
    
    # Eliminar la relación tarea-usuario
    db.delete(relation)
    db.commit()
    
    return {
        "status": 1,
        "message": f"Tarea confirmada y {reward}€ añadidos al usuario."
    }

# ELIMINAR TAREA - SOLO PADRE
@router.delete("/delete/{task_id}")
def delete_task(task_id: int = Path(...), db: Session = Depends(get_db), user=Depends(require_parent_from_token)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail={"status": 0, "message": "No se encontró la tarea con ese ID."})
    
    db.delete(task)
    db.commit()
    return {"status": 1, "message": "Tarea eliminada correctamente."}