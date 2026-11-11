from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, serializers
from django.db.models import Q, Sum
from core.models import MediaItem


class MediaItemSerializer(serializers.ModelSerializer):
    media_file_url = serializers.SerializerMethodField()

    class Meta:
        model = MediaItem
        fields = [
            'id',
            'title',
            'media_type',
            'preacher',
            'series',
            'date',
            'duration',
            'thumbnail_url',
            'media_file',
            'media_file_url',
            'media_url',
            'description',
            'featured',
            'views_count',
            'photos',
            'created_at',
            'updated_at'
        ]

    def get_media_file_url(self, obj):
        if obj.media_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.media_file.url)
            return obj.media_file.url
        return None


class MediaListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        media_type = request.query_params.get('type')
        search = request.query_params.get('search')
        series = request.query_params.get('series')
        featured = request.query_params.get('featured')
        limit = request.query_params.get('limit')

        queryset = MediaItem.objects.all().order_by('-date', '-created_at')

        if media_type and media_type != 'all':
            queryset = queryset.filter(media_type=media_type)

        if search:
            search = search.strip()
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(preacher__icontains=search) |
                Q(series__icontains=search) |
                Q(description__icontains=search)
            )

        if series and series != 'all':
            queryset = queryset.filter(series__iexact=series)

        if featured is not None:
            is_featured = featured.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(featured=is_featured)

        if limit:
            try:
                queryset = queryset[:int(limit)]
            except ValueError:
                pass

        serializer = MediaItemSerializer(queryset, many=True, context={'request': request})
        return Response({
            'success': True,
            'count': queryset.count() if not limit else len(serializer.data),
            'results': serializer.data
        })

    def post(self, request):
        data = request.data.copy()

        # Handle file upload if present
        if 'media_file' in request.FILES:
            data['media_file'] = request.FILES['media_file']

        serializer = MediaItemSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            item = serializer.save()
            return Response({
                'success': True,
                'message': f"{item.get_media_type_display()} created successfully",
                'item': MediaItemSerializer(item, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class MediaDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get_object(self, pk):
        try:
            return MediaItem.objects.get(pk=pk)
        except MediaItem.DoesNotExist:
            return None

    def get(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response({'success': False, 'error': 'Media item not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Increment view count
        item.views_count += 1
        item.save(update_fields=['views_count'])

        serializer = MediaItemSerializer(item, context={'request': request})
        return Response({'success': True, 'item': serializer.data})

    def put(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response({'success': False, 'error': 'Media item not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        if 'media_file' in request.FILES:
            data['media_file'] = request.FILES['media_file']

        serializer = MediaItemSerializer(item, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            updated = serializer.save()
            return Response({
                'success': True,
                'message': 'Media item updated successfully',
                'item': MediaItemSerializer(updated, context={'request': request}).data
            })
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        item = self.get_object(pk)
        if not item:
            return Response({'success': False, 'error': 'Media item not found'}, status=status.HTTP_404_NOT_FOUND)
        item.delete()
        return Response({'success': True, 'message': 'Media item deleted successfully'})


class MediaStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        audio_count = MediaItem.objects.filter(media_type='audio').count()
        video_count = MediaItem.objects.filter(media_type='video').count()
        photo_count = MediaItem.objects.filter(media_type='photo_gallery').count()
        total_views = MediaItem.objects.aggregate(total=Sum('views_count'))['total'] or 0

        # Approximate photo count inside galleries
        galleries = MediaItem.objects.filter(media_type='photo_gallery')
        approx_photos = sum(len(g.photos) if isinstance(g.photos, list) else 0 for g in galleries)
        if approx_photos == 0:
            approx_photos = photo_count * 50

        # Unique speakers/preachers
        speakers = MediaItem.objects.exclude(preacher__isnull=True).exclude(preacher='').values_list('preacher', flat=True).distinct()

        # Unique series
        series_list = MediaItem.objects.exclude(series__isnull=True).exclude(series='').values_list('series', flat=True).distinct()

        return Response({
            'success': True,
            'stats': {
                'total_sermons': audio_count + video_count,
                'audio_count': audio_count,
                'video_count': video_count,
                'gallery_count': photo_count,
                'total_photos': approx_photos,
                'total_views': total_views,
                'speakers': list(speakers),
                'series': list(series_list)
            }
        })


class MediaLatestView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Look for featured video or audio first, otherwise most recent video or audio
        featured = MediaItem.objects.filter(featured=True).first()
        if not featured:
            featured = MediaItem.objects.filter(media_type__in=['video', 'audio']).first()

        if not featured:
            return Response({'success': False, 'item': None})

        serializer = MediaItemSerializer(featured, context={'request': request})
        return Response({'success': True, 'item': serializer.data})

