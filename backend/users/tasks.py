from celery import shared_task
from time import sleep

@shared_task
def send_bulk_email():
    print("Sending bulk emails...")
    sleep(10)  # Simulate delay
    return "Emails sent!"