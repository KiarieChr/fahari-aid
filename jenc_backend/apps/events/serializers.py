from rest_framework import serializers
from core.models import Event, EventSchedule, EventRegistration, EventAttendance


class EventListSerializer(serializers.ModelSerializer):
    registrations_count = serializers.IntegerField(read_only=True, default=0)
    attendance_count = serializers.IntegerField(read_only=True, default=0)
    budget_status = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'ename',
            'branch',
            'start_date',
            'end_date',
            'start_time',
            'type',
            'status',
            'target_attendees',
            'facilitation_fee',
            'total_budget',
            'image',
            'registrations_count',
            'attendance_count',
            'budget_status',
        ]

    def get_budget_status(self, obj) -> None:
        # Contract: budget_status is always None (typed null)
        return None


class EventDetailSerializer(serializers.ModelSerializer):
    registrations_count = serializers.IntegerField(read_only=True, default=0)
    attendance_count = serializers.IntegerField(read_only=True, default=0)
    schedule_count = serializers.IntegerField(read_only=True, default=0)
    budget_status = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'ename',
            'branch',
            'start_date',
            'end_date',
            'start_time',
            'type',
            'status',
            'target_attendees',
            'facilitation_fee',
            'total_budget',
            'image',
            'notes',
            'delete_status',
            'created_at',
            'registrations_count',
            'attendance_count',
            'schedule_count',
            'budget_status',
        ]

    def get_budget_status(self, obj) -> None:
        # Contract: budget_status is always None (typed null)
        return None


class EventScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSchedule
        fields = [
            'id',
            'event_id',
            'day_number',
            'start_time',
            'end_time',
            'title',
            'description',
            'speaker',
            'session_type',
            'location',
            'sort_order',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EventRegistrationListSerializer(serializers.ModelSerializer):
    is_checked_in = serializers.BooleanField(read_only=True, default=False)
    check_in_time = serializers.DateTimeField(read_only=True, default=None)

    class Meta:
        model = EventRegistration
        # Contract: qr_token is strictly EXCLUDED from list responses
        fields = [
            'id',
            'event_id',
            'names',
            'gender',
            'serve',
            'attendees',
            'phone_no',
            'residence',
            'category',
            'travelling_from',
            'prayer',
            'special_needs',
            'guardian_telno',
            'email',
            'sponsorship',
            'created_at',
            'updated_at',
            'is_checked_in',
            'check_in_time',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EventRegistrationDetailSerializer(serializers.ModelSerializer):
    is_checked_in = serializers.BooleanField(read_only=True, default=False)
    check_in_time = serializers.DateTimeField(read_only=True, default=None)

    class Meta:
        model = EventRegistration
        # Contract: qr_token is returned in detail and create responses
        fields = [
            'id',
            'event_id',
            'names',
            'gender',
            'serve',
            'attendees',
            'phone_no',
            'residence',
            'category',
            'travelling_from',
            'prayer',
            'special_needs',
            'guardian_telno',
            'email',
            'sponsorship',
            'qr_token',
            'created_at',
            'updated_at',
            'is_checked_in',
            'check_in_time',
        ]
        read_only_fields = ['id', 'qr_token', 'created_at', 'updated_at']


class EventAttendanceRecordSerializer(serializers.ModelSerializer):
    names = serializers.CharField(source='registration_id.names', read_only=True)
    phone_no = serializers.CharField(source='registration_id.phone_no', read_only=True)
    checked_in_by_name = serializers.SerializerMethodField()

    class Meta:
        model = EventAttendance
        fields = [
            'id',
            'event_id',
            'registration_id',
            'check_in_time',
            'check_in_method',
            'checked_in_by',
            'checked_in_by_name',
            'notes',
            'names',
            'phone_no',
        ]
        read_only_fields = ['id', 'check_in_time', 'checked_in_by']

    def get_checked_in_by_name(self, obj):
        if obj.checked_in_by:
            return getattr(obj.checked_in_by, 'get_full_name', lambda: None)() or obj.checked_in_by.username
        return None
