from django.contrib import admin
from .models import GeneratedDocument


@admin.register(GeneratedDocument)
class GeneratedDocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'document_type', 'template_code', 'file_name', 'pdf_size_bytes', 'created_by', 'created_at')
    search_fields = ('document_type', 'template_code', 'file_name', 'created_by__email')
    list_filter = ('document_type', 'created_at')
    date_hierarchy = 'created_at'

