import logging
logger = logging.getLogger(__name__)

class MobileClientMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        version = request.headers.get('X-Client-Version')
        if version:
            request.mobile_client_version = version
            logger.info(f"Mobile client version: {version} — {request.method} {request.path}")
        return self.get_response(request)
