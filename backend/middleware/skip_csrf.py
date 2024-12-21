from rest_framework.authentication import SessionAuthentication

# Skip CSRF validation for development
class CSRFExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        # Skip CSRF validation
        return