from twilio.rest import Client
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

# Verificación de valores cargados
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Inicializar cliente de Twilio
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def send_sms(to_phone: str, message: str):
    try:
        # Verificar que el número tenga el formato correcto
        if not to_phone.startswith('+'):
            # Si no tiene +, asumir que es un número español y agregarlo
            to_phone = f"+34{to_phone}"
        
        message = client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=to_phone
        )
        
        print(f"SMS enviado correctamente. SID: {message.sid}")
        return True
        
    except Exception as e:
        print(f"Error al enviar SMS: {str(e)}")
        return False

def send_task_assignment_notification(user_name: str, task_title: str, reward: float, phone: str):
    message = f"\n¡Hola {user_name}!\n\nTe han asignado una nueva tarea: '{task_title}'\n\nRecompensa: {reward}€\n\n¡A por ella!"
    
    return send_sms(phone, message)