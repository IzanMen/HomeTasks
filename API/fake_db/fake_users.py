from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

fake_users = [
    {
        "id": 1,
        "username": "Izan",
        "password": pwd_context.hash("123456"),  
        "email": "sanchezginesizan@gmail.com",
        "role": "child", 
        "amount": 0.00,
    },
    {
        "id": 2,
        "username": "Joel",
        "password": pwd_context.hash("123456"),  
        "email": "sanchezginesjoel@gmail.com",
        "role": "child",
        "amount": 0.00,
    },
    {
        "id": 3,
        "username": "Èlia",
        "password": pwd_context.hash("123456"), 
        "email": "sanchezgineselia@gmail.com",
        "role": "child",
        "amount": 0.00,
    },
    {
        "id": 4,
        "username": "Fran",
        "password": pwd_context.hash("123456"), 
        "email": "iamfransanchez@gmail.com",
        "role": "parent"
    }
]
