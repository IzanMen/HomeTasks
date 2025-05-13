from database import engine, SessionLocal
from models.db_models import Base, User, Task, TaskUser
from passlib.context import CryptContext
from fake_db.fake_users import fake_users
from fake_db.fake_tasks import fake_tasks
from fake_db.fake_tasks_users import fake_tasks_users

# Configuración de hash para contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Crear todas las tablas
def init_db():
    Base.metadata.create_all(bind=engine)
    
    # Inicializar la base de datos con datos de ejemplo si está vacía
    db = SessionLocal()
    
    # Verificar si ya hay usuarios
    if db.query(User).count() == 0:
        # Insertar usuarios
        for user_data in fake_users:
            user = User(
                id=user_data["id"],
                username=user_data["username"],
                email=user_data["email"],
                password=user_data["password"],  # Ya está hasheado en fake_users
                role=user_data["role"],
                amount=user_data.get("amount", 0.0)
            )
            db.add(user)
        
        # Insertar tareas
        for task_data in fake_tasks:
            task = Task(
                id=task_data["id"],
                title=task_data["title"],
                description=task_data["description"],
                reward=task_data["reward"]
            )
            db.add(task)
        
        # Insertar relaciones tarea-usuario
        for task_user_data in fake_tasks_users:
            task_user = TaskUser(
                task_id=task_user_data["task_id"],
                user_id=task_user_data["user_id"],
                status=task_user_data["status"]
            )
            db.add(task_user)
        
        db.commit()
    
    db.close()

if __name__ == "__main__":
    print("Inicializando la base de datos...")
    init_db()
    print("Base de datos inicializada correctamente.")