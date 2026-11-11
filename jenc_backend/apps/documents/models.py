from django.db import models
from django.conf import settings

class GeneratedDocument(models.Model):
    document_type = models.CharField(max_length=50)
    template_code = models.CharField(max_length=50)
    file_name = models.CharField(max_length=255)
    pdf_size_bytes = models.PositiveIntegerField(default=0)
    branding_snapshot = models.JSONField(default=dict)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'generated_document'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.template_code} - {self.file_name} ({self.created_at})"
