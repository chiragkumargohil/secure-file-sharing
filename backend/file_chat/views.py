from rest_framework.views import APIView
from rest_framework.response import Response
from middleware.role_accessibility import role_accessibility
from files.models import File
from .models import FileChat, FileChatMessage
from rest_framework import status
from rest_framework.decorators import authentication_classes
from middleware.skip_csrf import CSRFExemptSessionAuthentication

@authentication_classes([CSRFExemptSessionAuthentication])
class FileChatMessagesView(APIView):
    @role_accessibility(['admin'])
    def get(self, request, file_id):
        """
        Get the chat history for a file.

        :param request: Request object
        :param file_id: File ID

        :return: Response object
        """
        try:
            file = File.objects.get(id=file_id)
            # get the number of chat entries
            num_chat_entries = FileChat.objects.filter(file=file, user=request.owner).count()
            
            chat = None
            if num_chat_entries == 0:
                chat = FileChat.objects.create(user=request.owner, file=file)
                FileChatMessage.objects.create(user=request.owner, chat=chat, role='assistant', content='Ask me anything about the file')
            else:
                chat = FileChat.objects.get(user=request.owner, file=file)

            chat_history = FileChatMessage.get_chat_history_by_file(file)
            chat_history = [{"role": chat.role, "content": chat.content, "created_at": chat.created_at} for chat in chat_history]
            return Response({"chat_history": chat_history}, status=status.HTTP_200_OK)
        except File.DoesNotExist:
            return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)
        
    @role_accessibility(['admin', 'editor'])
    def post(self, request, file_id):
        """
        Post a message to the chat.

        :param request: Request object
        :param file_id: File ID

        :return: Response object
        """
        try:
            file = File.objects.get(id=file_id)
            chat = FileChat.objects.get(user=request.user, file=file)
            content = request.data.get('content')

            # user message
            FileChatMessage.objects.create(user=request.user, chat=chat, role='user', content=content)

            assistant_response = "I will get back to you soon"

            # assistant message
            FileChatMessage.objects.create(user=request.user, chat=chat, role='assistant', content=assistant_response)
            
            data = {
            "role": 'assistant',
            "content": assistant_response,
            }

            return Response({"data": data}, status=status.HTTP_200_OK)
        except File.DoesNotExist:
            return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
        except FileChat.DoesNotExist:
            return Response({"error": "Chat not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "Something went wrong", "message": str(e)}, status=500)