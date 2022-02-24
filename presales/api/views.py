
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import HttpResponse
from management.models import *
from .serializers import *
import json

@api_view(['GET'])
def getData(request):
    activity = Activity.objects.all()
    serializer = ActivitySerializer(activity, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def postData(request):
    serializer = ActivitySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)

@csrf_exempt
def addData(request):
    if(request.method == 'POST'):
        activity = json.loads(request.body)
        #print only the first field
        print(activity["members"])

        return HttpResponse(json.dumps(activity), content_type='application/json')

    return HttpResponse(json.dumps({'POST working!': 'Nothing to see here!'}), content_type='application/json')