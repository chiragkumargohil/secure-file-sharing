import os
from celery import Celery

# Set default settings for Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")

# Create Celery instance
celery_app = Celery("app")

# Load config from settings.py
celery_app.config_from_object("django.conf:settings", namespace="CELERY")

# Autodiscover tasks from installed apps
celery_app.autodiscover_tasks()

@celery_app.task(bind=True)
def debug_task(self):
    print(f"Request: {self.request!r}")