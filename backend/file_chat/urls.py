from django.urls import path
from .views import FileChatMessagesView

urlpatterns = [
    path("<int:file_id>/", FileChatMessagesView.as_view(), name="chat_messages"),
]
