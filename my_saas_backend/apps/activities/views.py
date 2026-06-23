# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from rest_framework import status
# from .models import Activity
# from .serializers import ActivitySerializer


# class ActivityListCreateView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         activities = Activity.objects.filter(gym=request.user.gym)
#         return Response(ActivitySerializer(activities, many=True).data)

#     def post(self, request):
#         serializer = ActivitySerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save(gym=request.user.gym)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# class ActivityDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get_object(self, pk, gym):
#         try:
#             return Activity.objects.get(pk=pk, gym=gym)
#         except Activity.DoesNotExist:
#             return None

#     def put(self, request, pk):
#         obj = self.get_object(pk, request.user.gym)
#         if not obj:
#             return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
#         serializer = ActivitySerializer(obj, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         obj = self.get_object(pk, request.user.gym)
#         if not obj:
#             return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
#         obj.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Activity, Program, ProgramPackage
from .serializers import ActivitySerializer, ProgramSerializer, ProgramPackageSerializer


class ActivityListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        activities = Activity.objects.filter(gym=request.user.gym)
        return Response(ActivitySerializer(activities, many=True).data)

    def post(self, request):
        serializer = ActivitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(gym=request.user.gym)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ActivityDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, gym):
        try:
            return Activity.objects.get(pk=pk, gym=gym)
        except Activity.DoesNotExist:
            return None

    def put(self, request, pk):
        obj = self.get_object(pk, request.user.gym)
        if not obj:
            return Response({'error': 'Not found'}, status=404)
        serializer = ActivitySerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        obj = self.get_object(pk, request.user.gym)
        if not obj:
            return Response({'error': 'Not found'}, status=404)
        obj.delete()
        return Response(status=204)


# ── Programs ────────────────────────────────────────────────────────────────

class ProgramListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        programs = Program.objects.filter(gym=request.user.gym).prefetch_related('packages')
        return Response(ProgramSerializer(programs, many=True).data)

    def post(self, request):
        serializer = ProgramSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(gym=request.user.gym)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class ProgramDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, gym):
        try:
            return Program.objects.get(pk=pk, gym=gym)
        except Program.DoesNotExist:
            return None

    def get(self, request, pk):
        obj = self.get_object(pk, request.user.gym)
        if not obj:
            return Response({'error': 'Not found'}, status=404)
        return Response(ProgramSerializer(obj).data)

    def put(self, request, pk):
        obj = self.get_object(pk, request.user.gym)
        if not obj:
            return Response({'error': 'Not found'}, status=404)
        serializer = ProgramSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        obj = self.get_object(pk, request.user.gym)
        if not obj:
            return Response({'error': 'Not found'}, status=404)
        obj.delete()
        return Response(status=204)


# ── Program Packages ─────────────────────────────────────────────────────────

class ProgramPackageListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_program(self, program_pk, gym):
        try:
            return Program.objects.get(pk=program_pk, gym=gym)
        except Program.DoesNotExist:
            return None

    def get(self, request, program_pk):
        program = self.get_program(program_pk, request.user.gym)
        if not program:
            return Response({'error': 'Program not found'}, status=404)
        packages = program.packages.filter(is_active=True)
        return Response(ProgramPackageSerializer(packages, many=True).data)

    def post(self, request, program_pk):
        program = self.get_program(program_pk, request.user.gym)
        if not program:
            return Response({'error': 'Program not found'}, status=404)
        serializer = ProgramPackageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(program=program)
            return Response(ProgramSerializer(program).data, status=201)
        return Response(serializer.errors, status=400)


class ProgramPackageDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, gym):
        try:
            return ProgramPackage.objects.get(pk=pk, program__gym=gym)
        except ProgramPackage.DoesNotExist:
            return None

    def put(self, request, program_pk, pk):
        obj = self.get_object(pk, request.user.gym)
        if not obj:
            return Response({'error': 'Not found'}, status=404)
        serializer = ProgramPackageSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, program_pk, pk):
        obj = self.get_object(pk, request.user.gym)
        if not obj:
            return Response({'error': 'Not found'}, status=404)
        obj.delete()
        return Response(status=204)