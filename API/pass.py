from passlib.context import CryptContext

# Crear el contexto para bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# La contraseña a encriptar
password = "123456"

# Hash de la contraseña
hashed_password = pwd_context.hash(password)

# Mostrar el hash resultante
print(hashed_password)
