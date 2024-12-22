from django.core.mail import send_mail
from django.conf import settings

def send_email(subject, message, recipient_list):
  from_email = "no-reply@secureapp.com"
  if from_email:
    try: 
      send_mail(subject, message, from_email, recipient_list)
    except Exception as e:
      print(e)
  else:
    print("No email configured")