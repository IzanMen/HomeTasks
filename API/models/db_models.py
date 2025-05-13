from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

# Crear clase base para los modelos
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    password = Column(String(100))
    role = Column(String(20))
    amount = Column(Float, default=0.0)
    
    # Relación con las tareas asignadas
    tasks = relationship("TaskUser", back_populates="user")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100))
    description = Column(String(500))
    reward = Column(Float)
    
    # Relación con los usuarios asignados
    users = relationship("TaskUser", back_populates="task")

class TaskUser(Base):
    __tablename__ = "tasks_users"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    status = Column(String(20), default="PENDIENTE")
    
    # Relaciones
    task = relationship("Task", back_populates="users")
    user = relationship("User", back_populates="tasks")