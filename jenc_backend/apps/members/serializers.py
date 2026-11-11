from datetime import timedelta
from django.utils import timezone
from rest_framework import serializers
from core.models import Member, Cell, Department
from .models import CommittedMembers, Attendance, Meeting


class MemberSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(required=False, allow_blank=True)
    cell_name = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    is_new = serializers.SerializerMethodField()
    joined_on_formatted = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()

    class Meta:
        model = Member
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'phone_number', 'phone_no',
            'email', 'gender', 'marital', 'emp_status', 'bod',
            'address', 'location', 'cell_id', 'cell_name', 'department_id', 'department',
            'department_name', 'delete_status', 'joined_on', 'joined_on_formatted', 'is_new'
        ]
        extra_kwargs = {
            'first_name': {'required': True, 'allow_blank': False},
            'last_name': {'required': True, 'allow_blank': False},
            'gender': {'required': True, 'allow_blank': False},
            'phone_no': {'required': False},
            'email': {'required': False, 'allow_blank': True},
            'cell_id': {'required': False, 'allow_null': True},
            'department_id': {'required': False, 'allow_null': True},
            'joined_on': {'required': False},
        }

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name or ''}".strip()

    def get_cell_name(self, obj):
        if not obj.cell_id:
            return "Unassigned"
        cells_map = getattr(self.context.get('request'), '_cells_cache', None) if self.context.get('request') else None
        if cells_map is not None:
            return cells_map.get(obj.cell_id, "Unassigned")
        c = Cell.objects.filter(id=obj.cell_id).first()
        return c.name if c else "Unassigned"

    def get_department_name(self, obj):
        if obj.department_id:
            return obj.department_id.name
        return obj.department or "General"

    def get_is_new(self, obj):
        if not obj.joined_on:
            return False
        delta = timezone.now() - obj.joined_on
        return delta.total_seconds() <= (2 * 86400)

    def get_joined_on_formatted(self, obj):
        return obj.joined_on.strftime('%b %d, %Y') if obj.joined_on else '—'

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['phone_number'] = instance.phone_no or '—'
        ret['email'] = instance.email or '—'
        return ret

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        if 'phone_number' in data and not data.get('phone_no'):
            data['phone_no'] = data['phone_number']
        return super().to_internal_value(data)

    def validate(self, attrs):
        # 1. Phone validation
        phone = attrs.get('phone_no') or self.initial_data.get('phone_number') or self.initial_data.get('phone_no')
        if not phone:
            raise serializers.ValidationError({'phone_no': ['Phone number is required.']})

        clean_phone = str(phone).replace('+', '').strip()
        if not clean_phone.isdigit() or len(clean_phone) < 9:
            raise serializers.ValidationError({'phone_no': ['Enter a valid phone number (at least 9 digits).']})

        # Check phone uniqueness
        qs = Member.objects.filter(phone_no=phone)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError({'phone_no': ['A member with this phone number already exists.']})
        attrs['phone_no'] = phone

        # 2. Joined on default
        if not attrs.get('joined_on'):
            attrs['joined_on'] = timezone.now()

        return attrs


class CommittedMembersSerializer(serializers.ModelSerializer):
    linked_member_name = serializers.SerializerMethodField()
    member_email = serializers.CharField(source='member.email', read_only=True, default='—')
    member_phone = serializers.CharField(source='member.phone_no', read_only=True, default='—')
    committed_on_formatted = serializers.SerializerMethodField()
    created_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = CommittedMembers
        fields = [
            'id', 'member', 'member_id', 'full_name', 'phone', 'email',
            'residence', 'committed_on', 'committed_on_formatted',
            'created_at', 'created_at_formatted', 'linked_member_name',
            'member_email', 'member_phone'
        ]

    def get_linked_member_name(self, obj):
        if obj.member:
            return f"{obj.member.first_name} {obj.member.last_name or ''}".strip()
        return "Not Linked"

    def get_committed_on_formatted(self, obj):
        return obj.committed_on.strftime('%b %d, %Y') if obj.committed_on else '—'

    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%b %d, %Y') if obj.created_at else '—'
