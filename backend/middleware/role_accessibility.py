from functools import wraps
from django.http import JsonResponse

def role_accessibility(roles):
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(*args, **kwargs):
            # Check if it's a CBV by looking at the first argument (self)
            if hasattr(args[0], 'request'):
                # Class-based view
                request = args[0].request
            else:
                # Function-based view
                request = args[0]

            # Ensure the user has the correct role
            if not hasattr(request, 'user') or request.user.role not in roles:
                return JsonResponse({"error": "Access denied"}, status=403)
            
            return view_func(*args, **kwargs)
        
        return _wrapped_view
    return decorator