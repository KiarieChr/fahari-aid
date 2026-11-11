import os
import uuid
from django.conf import settings
from django.core.cache import cache
from rest_framework import serializers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.throttling import AnonRateThrottle

from .models import InstitutionSetting


class PublicBrandingSerializer(serializers.ModelSerializer):
    """
    Publicly whitelisted branding attributes consumed by the frontend.
    Explicitly excludes id, updated_by, and updated_at.
    """
    class Meta:
        model = InstitutionSetting
        fields = [
            'name',
            'short_name',
            'tagline',
            'logo_url',
            'logo_dark_url',
            'favicon_url',
            'primary_color',
            'accent_color',
            'secondary_color',
            'currency_symbol',
            'official_email',
            'official_phone',
            'physical_address',
        ]


class AdminBrandingSerializer(serializers.ModelSerializer):
    """
    Administrative branding serializer covering all model fields.
    updated_by and updated_at are read-only to prevent mass assignment.
    """
    class Meta:
        model = InstitutionSetting
        fields = '__all__'
        read_only_fields = ['id', 'updated_by', 'updated_at']


class PublicBrandingView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def get(self, request):
        cache_key = 'branding:public'
        data = cache.get(cache_key)
        if data is None:
            settings_obj = InstitutionSetting.get_settings()
            serializer = PublicBrandingSerializer(settings_obj)
            data = serializer.data
            # Cache for ~5 minutes (300 seconds)
            cache.set(cache_key, data, timeout=300)
        return Response(data, status=status.HTTP_200_OK)


class ManageBrandingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        settings_obj = InstitutionSetting.get_settings()
        serializer = AdminBrandingSerializer(settings_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        settings_obj = InstitutionSetting.get_settings()
        serializer = AdminBrandingSerializer(settings_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_by=request.user if request.user.is_authenticated else None)
            # Invalidate public branding cache on update
            cache.delete('branding:public')
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BrandingAssetUploadView(APIView):
    """
    Handles direct file uploads for branding images (logos, favicons).
    Stores images under MEDIA_ROOT/branding/ and returns the URL.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    ALLOWED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.svg', '.webp', '.ico', '.gif'}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No image file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check extension
        ext = os.path.splitext(file_obj.name)[1].lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            allowed_str = ', '.join(sorted(self.ALLOWED_EXTENSIONS))
            return Response(
                {'error': f"Unsupported file extension '{ext}'. Allowed: {allowed_str}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check size
        if file_obj.size > self.MAX_FILE_SIZE:
            return Response(
                {'error': 'File size exceeds maximum allowed limit of 5MB.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        asset_type = request.data.get('asset_type', 'logo').strip().lower()
        if asset_type not in {'logo', 'logo_dark', 'favicon'}:
            asset_type = 'branding'

        # Generate unique safe filename
        safe_filename = f"{asset_type}_{uuid.uuid4().hex[:10]}{ext}"
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'branding')
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, safe_filename)

        with open(file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        # Build URL
        relative_url = f"{settings.MEDIA_URL}branding/{safe_filename}"
        absolute_url = request.build_absolute_uri(relative_url)

        return Response({
            'url': absolute_url,
            'relative_url': relative_url,
            'filename': safe_filename,
            'asset_type': asset_type,
        }, status=status.HTTP_201_CREATED)

