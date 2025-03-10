from django.urls import path, include
from rest_framework.routers import DefaultRouter

from backend.views.log import LogViewSet

router = DefaultRouter()
router.register('logs', LogViewSet)
urlpatterns = [
    path('api/', include(router.urls)),
]
