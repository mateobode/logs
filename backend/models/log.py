from django.db import models
from backend.utils import SEVERITY_CHOICES


class Log(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    message = models.TextField(null=False, blank=False)
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, null=False, blank=False)
    source = models.CharField(max_length=100, null=False, blank=False)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.timestamp} [{self.severity}] {self.source}: {self.message[:50]}"
