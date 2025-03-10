from rest_framework import serializers
from backend.models.log import Log

class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = "__all__"
