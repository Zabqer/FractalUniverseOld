import datetime
from django.http import StreamingHttpResponse
import time

# @csrf_exempt

def iterator(request):
    user = request.user
    while True:
            yield "data: test"
            time.sleep(1)
def sse(request):
    response = StreamingHttpResponse(streaming_content=iterator(request=request), content_type="text/event-stream")
    response['Cache-Control'] = 'no-cache'
    response['connection'] = 'keep-alive'
    return response
