import secrets
from django.db.models import Count, Q, F, OuterRef, Exists, Subquery
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from core.models import Event, EventSchedule, EventRegistration, EventAttendance
from .serializers import (
    EventListSerializer,
    EventDetailSerializer,
    EventScheduleSerializer,
    EventRegistrationListSerializer,
    EventRegistrationDetailSerializer,
    EventAttendanceRecordSerializer,
)
from .permissions import CanViewEventRegistrations


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


# ==============================================================================
# 0. EVENT LOOKUPS
# ==============================================================================

class EventLookupsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        types = list(Event.objects.exclude(type__isnull=True).exclude(type='').values_list('type', flat=True).distinct())
        default_types = ['general', 'conference', 'retreat', 'training', 'worship', 'youth', 'outreach', 'special']
        all_types = sorted(list(set(types + default_types)))

        branches = list(Event.objects.exclude(branch__isnull=True).exclude(branch='').values_list('branch', flat=True).distinct())

        session_types = [{'value': k, 'label': v} for k, v in EventSchedule.SESSION_TYPE_CHOICES]

        return Response({
            'types': all_types,
            'branches': sorted(branches),
            'statuses': ['published', 'draft', 'archived', 'completed', 'cancelled'],
            'session_types': session_types,
        })


# ==============================================================================
# 1. EVENT CRUD ENDPOINTS
# ==============================================================================

class EventListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Event.objects.filter(delete_status=False).annotate(
            registrations_count=Count('registrations', distinct=True),
            attendance_count=Count('attendances', distinct=True),
        ).order_by('-start_date')

        # Filters
        q = request.query_params.get('q', '').strip()
        if q:
            queryset = queryset.filter(
                Q(ename__icontains=q) |
                Q(branch__icontains=q) |
                Q(notes__icontains=q)
            )

        status_param = request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status__iexact=status_param)

        type_param = request.query_params.get('type')
        if type_param:
            queryset = queryset.filter(type__iexact=type_param)

        branch_param = request.query_params.get('branch')
        if branch_param:
            queryset = queryset.filter(branch__iexact=branch_param)

        date_from = request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(start_date__date__gte=date_from)

        date_to = request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(start_date__date__lte=date_to)

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = EventListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        serializer = EventDetailSerializer(data=data)
        if serializer.is_valid():
            event = serializer.save()
            # Return detailed view
            annotated_event = Event.objects.filter(pk=event.pk).annotate(
                registrations_count=Count('registrations', distinct=True),
                attendance_count=Count('attendances', distinct=True),
                schedule_count=Count('schedules', distinct=True),
            ).first()
            return Response(EventDetailSerializer(annotated_event).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventDetailUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(
            Event.objects.filter(delete_status=False).annotate(
                registrations_count=Count('registrations', distinct=True),
                attendance_count=Count('attendances', distinct=True),
                schedule_count=Count('schedules', distinct=True),
            ),
            pk=pk
        )

    def get(self, request, pk):
        event = self.get_object(pk)
        serializer = EventDetailSerializer(event)
        return Response(serializer.data)

    def patch(self, request, pk):
        event = get_object_or_404(Event, pk=pk, delete_status=False)
        serializer = EventDetailSerializer(event, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            annotated_event = self.get_object(pk)
            return Response(EventDetailSerializer(annotated_event).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        event = get_object_or_404(Event, pk=pk)
        # Contract: DELETE /events/<id>/ on an event with registrations -> returns 409
        if event.registrations.exists():
            return Response(
                {
                    'error': 'Cannot delete event with existing registrations.',
                    'registrations_count': event.registrations.count()
                },
                status=status.HTTP_409_CONFLICT
            )
        event.delete_status = True
        event.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Alias for convenience
EventDetailView = EventDetailUpdateDeleteView


# ==============================================================================
# 2. EVENT SCHEDULING ENDPOINTS
# ==============================================================================

class EventScheduleListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        get_object_or_404(Event, pk=event_id, delete_status=False)
        schedules = EventSchedule.objects.filter(event_id=event_id).order_by(
            'day_number', 'sort_order', 'start_time'
        )
        serializer = EventScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

    def post(self, request, event_id):
        event = get_object_or_404(Event, pk=event_id, delete_status=False)
        data = request.data.copy()
        data['event_id'] = event.id
        serializer = EventScheduleSerializer(data=data)
        if serializer.is_valid():
            serializer.save(event_id=event)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventScheduleDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, event_id, session_id):
        return get_object_or_404(EventSchedule, pk=session_id, event_id=event_id)

    def get(self, request, event_id, session_id):
        session = self.get_object(event_id, session_id)
        serializer = EventScheduleSerializer(session)
        return Response(serializer.data)

    def patch(self, request, event_id, session_id):
        session = self.get_object(event_id, session_id)
        serializer = EventScheduleSerializer(session, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, event_id, session_id):
        session = self.get_object(event_id, session_id)
        session.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================================================================
# 3. EVENT REGISTRATION ENDPOINTS
# ==============================================================================

class EventRegistrationListCreateView(APIView):
    permission_classes = [IsAuthenticated, CanViewEventRegistrations]

    def get_queryset(self, event_id):
        return EventRegistration.objects.filter(event_id=event_id).annotate(
            is_checked_in=Exists(
                EventAttendance.objects.filter(
                    event_id=OuterRef('event_id'),
                    registration_id=OuterRef('pk')
                )
            ),
            check_in_time=Subquery(
                EventAttendance.objects.filter(
                    event_id=OuterRef('event_id'),
                    registration_id=OuterRef('pk')
                ).values('check_in_time')[:1]
            )
        ).order_by('-created_at')

    def get(self, request, event_id):
        get_object_or_404(Event, pk=event_id, delete_status=False)
        queryset = self.get_queryset(event_id)

        # Filters
        q = request.query_params.get('q', '').strip()
        if q:
            queryset = queryset.filter(
                Q(names__icontains=q) |
                Q(phone_no__icontains=q) |
                Q(email__icontains=q) |
                Q(residence__icontains=q)
            )

        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__iexact=category)

        gender = request.query_params.get('gender')
        if gender:
            queryset = queryset.filter(gender__iexact=gender)

        checked_in = request.query_params.get('is_checked_in')
        if checked_in is not None and checked_in != '':
            val = str(checked_in).lower() in ['true', '1']
            queryset = queryset.filter(is_checked_in=val)

        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request)
        # Contract: qr_token is never in list responses
        serializer = EventRegistrationListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request, event_id):
        event = get_object_or_404(Event, pk=event_id, delete_status=False)
        data = request.data.copy()
        data['event_id'] = event.id

        serializer = EventRegistrationDetailSerializer(data=data)
        if serializer.is_valid():
            # Generate cryptographic 32-character hex qr_token
            qr_token = secrets.token_hex(16)
            registration = serializer.save(event_id=event, qr_token=qr_token)
            # Contract: qr_token returned in detail and create responses
            return Response(
                EventRegistrationDetailSerializer(registration).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventRegistrationDetailView(APIView):
    permission_classes = [IsAuthenticated, CanViewEventRegistrations]

    def get_object(self, event_id, reg_id):
        return get_object_or_404(
            EventRegistration.objects.filter(event_id=event_id).annotate(
                is_checked_in=Exists(
                    EventAttendance.objects.filter(
                        event_id=OuterRef('event_id'),
                        registration_id=OuterRef('pk')
                    )
                ),
                check_in_time=Subquery(
                    EventAttendance.objects.filter(
                        event_id=OuterRef('event_id'),
                        registration_id=OuterRef('pk')
                    ).values('check_in_time')[:1]
                )
            ),
            pk=reg_id
        )

    def get(self, request, event_id, reg_id):
        registration = self.get_object(event_id, reg_id)
        # Contract: qr_token returned in detail responses
        serializer = EventRegistrationDetailSerializer(registration)
        return Response(serializer.data)

    def patch(self, request, event_id, reg_id):
        registration = get_object_or_404(EventRegistration, pk=reg_id, event_id=event_id)
        serializer = EventRegistrationDetailSerializer(registration, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            annotated_reg = self.get_object(event_id, reg_id)
            return Response(EventRegistrationDetailSerializer(annotated_reg).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, event_id, reg_id):
        registration = get_object_or_404(EventRegistration, pk=reg_id, event_id=event_id)
        registration.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================================================================
# 4. EVENT CHECK-IN & UNDO ENDPOINTS
# ==============================================================================

class EventCheckinView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, event_id):
        event = get_object_or_404(Event, pk=event_id, delete_status=False)
        reg_id = request.data.get('registration_id')

        if not reg_id:
            return Response({'registration_id': ['This field is required.']}, status=status.HTTP_400_BAD_REQUEST)

        registration = get_object_or_404(EventRegistration, pk=reg_id, event_id=event.id)

        # Contract: POST /checkin/ twice for the same registration -> second returns 409
        existing_att = EventAttendance.objects.filter(event_id=event.id, registration_id=registration.id).first()
        if existing_att:
            return Response(
                {
                    'error': 'Attendee is already checked in.',
                    'attendance_id': existing_att.id,
                    'check_in_time': existing_att.check_in_time
                },
                status=status.HTTP_409_CONFLICT
            )

        check_in_method = request.data.get('check_in_method', 'manual')
        notes = request.data.get('notes', '')

        attendance = EventAttendance.objects.create(
            event_id=event,
            registration_id=registration,
            check_in_method=check_in_method,
            checked_in_by=request.user,
            notes=notes
        )

        serializer = EventAttendanceRecordSerializer(attendance)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EventCheckinUndoView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, event_id, reg_id):
        # Contract: DELETE /checkin/<reg_id>/ on a non-existent row -> returns 404
        attendance = EventAttendance.objects.filter(event_id=event_id, registration_id=reg_id).first()
        if not attendance:
            return Response(
                {'error': 'Attendance record not found for this registration.'},
                status=status.HTTP_404_NOT_FOUND
            )

        attendance.delete()
        return Response(
            {'message': 'Check-in undone successfully.'},
            status=status.HTTP_200_OK
        )


class EventCheckinStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        event = get_object_or_404(Event, pk=event_id, delete_status=False)

        total_registered = EventRegistration.objects.filter(event_id=event.id).count()
        total_checked_in = EventAttendance.objects.filter(event_id=event.id).count()
        pending_checkin = max(0, total_registered - total_checked_in)
        rate = round((total_checked_in / total_registered * 100), 1) if total_registered > 0 else 0.0

        recent_records = EventAttendance.objects.filter(
            event_id=event.id
        ).select_related('registration_id', 'checked_in_by').order_by('-check_in_time')[:10]

        recent_serializer = EventAttendanceRecordSerializer(recent_records, many=True)

        return Response({
            'event_id': event.id,
            'event_name': event.ename,
            'total_registered': total_registered,
            'total_checked_in': total_checked_in,
            'total_pending': pending_checkin,
            'attendance_rate': rate,
            'recent_checkins': recent_serializer.data,
        })


# ==============================================================================
# 5. DEMOGRAPHIC ANALYTICS ENDPOINT
# ==============================================================================

class EventDemographicsAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        event = get_object_or_404(Event, pk=event_id, delete_status=False)
        registrations = EventRegistration.objects.filter(event_id=event.id)

        # 1. Attendance count (1 query)
        total_attended = EventAttendance.objects.filter(event_id=event.id).count()

        # 2. Collapsed conditional aggregation on registrations (1 query)
        stats = registrations.aggregate(
            total=Count('id'),
            male=Count('id', filter=Q(gender__iexact='male')),
            female=Count('id', filter=Q(gender__iexact='female')),
            other_gender=Count('id', filter=~Q(gender__in=['male', 'female', 'Male', 'Female']) & Q(gender__isnull=False)),
            serving=Count('id', filter=Q(serve=True)),
            non_serving=Count('id', filter=Q(serve=False) | Q(serve__isnull=True)),
        )

        total_registered = stats['total']

        gender_dist = [
            {'gender': 'Male', 'count': stats['male']},
            {'gender': 'Female', 'count': stats['female']},
        ]
        if stats['other_gender'] > 0:
            gender_dist.append({'gender': 'Other', 'count': stats['other_gender']})

        serving_dist = [
            {'serve': True, 'count': stats['serving']},
            {'serve': False, 'count': stats['non_serving']},
        ]

        # 3. Category distribution (1 query)
        category_dist = list(
            registrations.filter(category__isnull=False)
            .values('category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # 4. Residence distribution (1 query)
        residence_dist = list(
            registrations.filter(residence__isnull=False)
            .values('residence')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )

        attendance_rate = round((total_attended / total_registered * 100), 1) if total_registered > 0 else 0.0

        return Response({
            'event_id': event.id,
            'event_name': event.ename,
            'total_registrations': total_registered,
            'total_attended': total_attended,
            'attendance_rate': attendance_rate,
            'gender_distribution': gender_dist,
            'category_distribution': category_dist,
            'top_residences': residence_dist,
            'travelling_from': residence_dist,
            'serving_breakdown': serving_dist,
            'sponsorship_breakdown': [],
            # Contract: financials is always None in the demographics payload
            'financials': None,
        })


class EventBudgetView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, event_id):
        event = get_object_or_404(Event, pk=event_id, delete_status=False)
        total_budget = float(event.total_budget or 0)
        has_budget = total_budget > 0

        budget_data = {
            'id': event.id,
            'event_id': event.id,
            'budget_name': f"{event.ename} Budget Plan",
            'status': 'approved' if has_budget else 'draft',
            'total_estimated': total_budget,
            'total_actual': 0.0,
            'notes': event.notes or '',
            'created_at': event.created_at,
        } if has_budget else None

        versions = [
            {
                'id': 1,
                'version': 1,
                'budget_name': f"{event.ename} Budget Plan",
                'status': 'approved' if has_budget else 'draft',
                'total_estimated': total_budget,
                'total_actual': 0.0,
                'created_at': event.created_at,
            }
        ] if has_budget else []

        return Response({
            'success': True,
            'data': {
                'event': {
                    'id': event.id,
                    'ename': event.ename,
                    'start_date': event.start_date,
                    'end_date': event.end_date,
                    'total_budget': total_budget,
                    'facilitation_fee': float(event.facilitation_fee or 0),
                    'target_attendees': event.target_attendees or 0,
                },
                'budget': budget_data,
                'versions': versions,
                'items': [],
                'audit': [],
                'category_summary': [],
            }
        })

    def post(self, request, event_id):
        event = get_object_or_404(Event, pk=event_id, delete_status=False)
        action = request.data.get('action')
        amount = request.data.get('estimated_amount') or request.data.get('total_budget')
        if amount is not None:
            event.total_budget = float(amount)
            event.save(update_fields=['total_budget'])
            return Response({
                'success': True,
                'message': 'Budget updated successfully',
                'data': {'total_budget': float(event.total_budget or 0)}
            })
        return Response({'success': True, 'message': 'Budget action processed'})

