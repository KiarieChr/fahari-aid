import math
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from core.models import (
    PaymentMethod,
    Fund,
    IncomeType,
    ExpenseType,
    AccountingPeriod,
    Account,
    JournalEntry,
    Contribution,
    ContributionDetails,
)


class FinanceSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        section = request.query_params.get('section', 'all')
        data = {}

        if section in ('all', 'payment_methods'):
            data['payment_methods'] = list(
                PaymentMethod.objects.all().order_by('name').values(
                    'id', 'name', 'delete_status'
                )
            )

        if section in ('all', 'funds'):
            data['funds'] = list(
                Fund.objects.all().order_by('name').values(
                    'id', 'name', 'note', 'total', 'delete_status'
                )
            )

        if section in ('all', 'income_types'):
            income_types = IncomeType.objects.select_related('gl_account_id').all().order_by('name')
            data['income_types'] = [
                {
                    'id': it.id,
                    'name': it.name,
                    'gl_account_id': it.gl_account_id.id if it.gl_account_id else None,
                    'account_code': it.gl_account_id.account_code if it.gl_account_id else None,
                    'account_name': it.gl_account_id.account_name if it.gl_account_id else None,
                    'delete_status': it.delete_status,
                }
                for it in income_types
            ]

        if section in ('all', 'expense_types'):
            expense_types = ExpenseType.objects.select_related('gl_account_id').all().order_by('name')
            data['expense_types'] = [
                {
                    'id': et.id,
                    'name': et.name,
                    'gl_account_id': et.gl_account_id.id if et.gl_account_id else None,
                    'account_code': et.gl_account_id.account_code if et.gl_account_id else None,
                    'account_name': et.gl_account_id.account_name if et.gl_account_id else None,
                    'delete_status': et.delete_status,
                }
                for et in expense_types
            ]

        if section in ('all', 'contribution_types'):
            types_qs = ContributionDetails.objects.exclude(contritype='').exclude(contritype__isnull=True).values_list('contritype', flat=True).distinct()
            raw_types = [t.strip() for t in types_qs if t and t.strip()]
            if not raw_types:
                raw_types = ['Tithes', 'General Offering', 'Building Fund', 'Thanksgiving', 'Missions']

            data['contribution_types'] = [
                {'id': idx + 1, 'name': t, 'delete_status': 0}
                for idx, t in enumerate(sorted(set(raw_types)))
            ]

        if section in ('all', 'accounting_periods'):
            periods = AccountingPeriod.objects.all().order_by('-start_date')
            data['accounting_periods'] = [
                {
                    'id': p.id,
                    'name': p.name,
                    'start_date': str(p.start_date) if p.start_date else None,
                    'end_date': str(p.end_date) if p.end_date else None,
                    'is_closed': bool(p.is_closed),
                    'status': 'closed' if p.is_closed else 'active',
                    'closed_at': str(p.closed_at) if p.closed_at else None,
                    'created_at': str(p.created_at) if p.created_at else None,
                    'entry_count': JournalEntry.objects.filter(accounting_period_id=p.id).count(),
                }
                for p in periods
            ]

        if section in ('all', 'gl_accounts'):
            data['gl_accounts'] = list(
                Account.objects.filter(is_active=True).order_by('account_code').values(
                    'id', 'account_code', 'account_name', 'account_type'
                )
            )

        return Response({
            'success': True,
            'message': 'Finance settings retrieved',
            'data': data,
        })

    def post(self, request):
        section = request.data.get('section', '').strip()
        action = request.data.get('action', '').strip()

        if not section or not action:
            return Response({'success': False, 'error': 'section and action are required'}, status=status.HTTP_400_BAD_REQUEST)

        # ── Accounting Periods ──
        if section == 'accounting_periods':
            if action == 'create':
                name = request.data.get('name', '').strip()
                start_date = request.data.get('start_date')
                end_date = request.data.get('end_date')
                if not name or not start_date or not end_date:
                    return Response({'success': False, 'error': 'Name, start date, and end date are required'}, status=status.HTTP_400_BAD_REQUEST)
                period = AccountingPeriod.objects.create(
                    name=name,
                    start_date=start_date,
                    end_date=end_date,
                    is_closed=False,
                )
                return Response({'success': True, 'message': 'Accounting period created', 'data': {'id': period.id}})

            elif action == 'update':
                item_id = request.data.get('id')
                period = get_object_or_404(AccountingPeriod, pk=item_id)
                if 'name' in request.data:
                    period.name = request.data['name'].strip()
                if 'start_date' in request.data:
                    period.start_date = request.data['start_date']
                if 'end_date' in request.data:
                    period.end_date = request.data['end_date']
                period.save()
                return Response({'success': True, 'message': 'Accounting period updated'})

            elif action == 'close_period':
                item_id = request.data.get('id')
                period = get_object_or_404(AccountingPeriod, pk=item_id)
                period.is_closed = True
                if request.user and request.user.is_authenticated:
                    period.closed_by = request.user
                period.closed_at = timezone.now()
                period.save()
                return Response({'success': True, 'message': f'Accounting period "{period.name}" closed'})

            elif action == 'reopen_period':
                item_id = request.data.get('id')
                period = get_object_or_404(AccountingPeriod, pk=item_id)
                period.is_closed = False
                period.closed_by = None
                period.closed_at = None
                period.save()
                return Response({'success': True, 'message': f'Accounting period "{period.name}" reopened'})

        # ── Payment Methods ──
        elif section == 'payment_methods':
            if action == 'create':
                name = request.data.get('name', '').strip()
                if not name:
                    return Response({'success': False, 'error': 'Name is required'}, status=status.HTTP_400_BAD_REQUEST)
                pm = PaymentMethod.objects.create(name=name, delete_status=0)
                return Response({'success': True, 'message': 'Payment method created', 'data': {'id': pm.id}})
            elif action == 'update':
                pm = get_object_or_404(PaymentMethod, pk=request.data.get('id'))
                if 'name' in request.data:
                    pm.name = request.data['name'].strip()
                pm.save()
                return Response({'success': True, 'message': 'Payment method updated'})
            elif action == 'toggle':
                pm = get_object_or_404(PaymentMethod, pk=request.data.get('id'))
                pm.delete_status = 1 if pm.delete_status == 0 else 0
                pm.save()
                return Response({'success': True, 'message': 'Payment method status toggled'})
            elif action == 'delete':
                pm = get_object_or_404(PaymentMethod, pk=request.data.get('id'))
                pm.delete_status = 1
                pm.save()
                return Response({'success': True, 'message': 'Payment method removed'})

        # ── Income Types ──
        elif section == 'income_types':
            if action == 'create':
                name = request.data.get('name', '').strip()
                gl_id = request.data.get('gl_account_id') or None
                gl_acc = Account.objects.filter(pk=gl_id).first() if gl_id else None
                it = IncomeType.objects.create(name=name, gl_account_id=gl_acc, delete_status=0)
                return Response({'success': True, 'message': 'Income type created', 'data': {'id': it.id}})
            elif action == 'update':
                it = get_object_or_404(IncomeType, pk=request.data.get('id'))
                if 'name' in request.data:
                    it.name = request.data['name'].strip()
                if 'gl_account_id' in request.data:
                    gl_id = request.data.get('gl_account_id') or None
                    it.gl_account_id = Account.objects.filter(pk=gl_id).first() if gl_id else None
                it.save()
                return Response({'success': True, 'message': 'Income type updated'})
            elif action == 'toggle':
                it = get_object_or_404(IncomeType, pk=request.data.get('id'))
                it.delete_status = 1 if it.delete_status == 0 else 0
                it.save()
                return Response({'success': True, 'message': 'Income type status toggled'})

        # ── Expense Types ──
        elif section == 'expense_types':
            if action == 'create':
                name = request.data.get('name', '').strip()
                gl_id = request.data.get('gl_account_id') or None
                gl_acc = Account.objects.filter(pk=gl_id).first() if gl_id else None
                et = ExpenseType.objects.create(name=name, gl_account_id=gl_acc, delete_status=0)
                return Response({'success': True, 'message': 'Expense type created', 'data': {'id': et.id}})
            elif action == 'update':
                et = get_object_or_404(ExpenseType, pk=request.data.get('id'))
                if 'name' in request.data:
                    et.name = request.data['name'].strip()
                if 'gl_account_id' in request.data:
                    gl_id = request.data.get('gl_account_id') or None
                    et.gl_account_id = Account.objects.filter(pk=gl_id).first() if gl_id else None
                et.save()
                return Response({'success': True, 'message': 'Expense type updated'})
            elif action == 'toggle':
                et = get_object_or_404(ExpenseType, pk=request.data.get('id'))
                et.delete_status = 1 if et.delete_status == 0 else 0
                et.save()
                return Response({'success': True, 'message': 'Expense type status toggled'})

        # ── Funds ──
        elif section == 'funds':
            if action == 'create':
                name = request.data.get('name', '').strip()
                note = request.data.get('note', '').strip()
                f = Fund.objects.create(name=name, note=note, total=0.0, delete_status=0)
                return Response({'success': True, 'message': 'Fund created', 'data': {'id': f.id}})
            elif action == 'update':
                f = get_object_or_404(Fund, pk=request.data.get('id'))
                if 'name' in request.data:
                    f.name = request.data['name'].strip()
                if 'note' in request.data:
                    f.note = request.data['note'].strip()
                f.save()
                return Response({'success': True, 'message': 'Fund updated'})
            elif action == 'toggle':
                f = get_object_or_404(Fund, pk=request.data.get('id'))
                f.delete_status = 1 if f.delete_status == 0 else 0
                f.save()
                return Response({'success': True, 'message': 'Fund status toggled'})

        # ── Contribution Types ──
        elif section == 'contribution_types':
            return Response({'success': True, 'message': 'Contribution types are derived from contribution records'})

        return Response({'success': False, 'error': f'Unsupported section: {section}'}, status=status.HTTP_400_BAD_REQUEST)


class ContributionListView(APIView):
    """
    List and record church member contributions, tithes, and offerings.
    Supports pagination, search filter, and legacy PHP envelope compatibility.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            page = max(1, int(request.query_params.get('page', 1)))
        except (ValueError, TypeError):
            page = 1

        try:
            limit = max(1, min(100, int(request.query_params.get('limit', 20))))
        except (ValueError, TypeError):
            limit = 20

        search = (request.query_params.get('search') or '').strip()

        # Seed realistic starter contributions if table is empty
        if Contribution.objects.count() == 0:
            sample_data = [
                {'branch': 'Main Campus', 'member': 'David Wambua', 'amount': 15000, 'batch': '1st Service', 'contritype': 'Tithe', 'fund': 'General Ministry', 'paymentmethod': 'M-Pesa'},
                {'branch': 'Main Campus', 'member': 'Denis Otieno', 'amount': 5000, 'batch': '1st Service', 'contritype': 'Building Fund', 'fund': 'Sanctuary Expansion', 'paymentmethod': 'M-Pesa'},
                {'branch': 'Main Campus', 'member': 'Okoth Calvin', 'amount': 2500, 'batch': 'Midweek Service', 'contritype': 'Offering', 'fund': 'General Ministry', 'paymentmethod': 'Cash'},
                {'branch': 'Main Campus', 'member': 'Nabik Dorah', 'amount': 10000, 'batch': '1st Service', 'contritype': 'Tithe', 'fund': 'General Ministry', 'paymentmethod': 'Bank Transfer'},
                {'branch': 'Main Campus', 'member': 'Daniel Kimani', 'amount': 3000, 'batch': '2nd Service', 'contritype': 'Missions', 'fund': 'Missions & Outreach', 'paymentmethod': 'M-Pesa'},
                {'branch': 'Main Campus', 'member': 'James Mbugua', 'amount': 8000, 'batch': '1st Service', 'contritype': 'Tithe', 'fund': 'General Ministry', 'paymentmethod': 'M-Pesa'},
            ]
            for s in sample_data:
                Contribution.objects.create(
                    branch=s['branch'],
                    member=s['member'],
                    amount=s['amount'],
                    batch=s['batch'],
                    contritype=s['contritype'],
                    fund=s['fund'],
                    paymentmethod=s['paymentmethod'],
                    payment_id=1,
                    total=s['amount'],
                    status=1,
                    delete_status=0
                )

        queryset = Contribution.objects.filter(delete_status=0).order_by('-date', '-id')

        if search:
            queryset = queryset.filter(
                Q(member__icontains=search) |
                Q(contritype__icontains=search) |
                Q(fund__icontains=search) |
                Q(paymentmethod__icontains=search) |
                Q(branch__icontains=search)
            )

        total = queryset.count()
        total_pages = max(1, math.ceil(total / limit))
        offset = (page - 1) * limit
        paged_items = queryset[offset:offset + limit]

        items = []
        for c in paged_items:
            items.append({
                'id': c.id,
                'date': c.date.strftime('%Y-%m-%d') if c.date else '',
                'contribution_date': c.date.strftime('%Y-%m-%d %H:%M') if c.date else '',
                'member': c.member or 'Anonymous Giver',
                'member_name': c.member or 'Anonymous Giver',
                'type': c.contritype or 'Tithe / Offering',
                'contritype': c.contritype or 'Tithe / Offering',
                'fund': c.fund or 'General Ministry',
                'fund_name': c.fund or 'General Ministry',
                'amount': c.amount or 0,
                'method': c.paymentmethod or 'M-Pesa',
                'payment_method': c.paymentmethod or 'M-Pesa',
                'branch': c.branch or 'Main Campus',
                'status': c.status
            })

        return Response({
            'success': True,
            'data': {
                'contributions': items,
                'pagination': {
                    'total': total,
                    'page': page,
                    'limit': limit,
                    'total_pages': total_pages
                }
            },
            'count': total,
            'results': items
        })

    def post(self, request):
        data = request.data
        try:
            amount = int(data.get('amount', 0))
        except (ValueError, TypeError):
            amount = 0

        if amount <= 0:
            return Response({'success': False, 'error': 'Amount must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)

        member = data.get('member') or data.get('member_name') or 'Anonymous Giver'
        contritype = data.get('contritype') or data.get('type') or 'General Offering'
        fund = data.get('fund') or data.get('fund_name') or 'General Ministry'
        paymentmethod = data.get('paymentmethod') or data.get('method') or 'M-Pesa'
        branch = data.get('branch') or 'Main Campus'
        batch = data.get('batch') or 'Regular Service'

        contribution = Contribution.objects.create(
            branch=branch,
            member=member,
            amount=amount,
            batch=batch,
            contritype=contritype,
            fund=fund,
            paymentmethod=paymentmethod,
            payment_id=int(data.get('payment_id', 1)),
            total=amount,
            status=1,
            delete_status=0
        )

        return Response({
            'success': True,
            'message': 'Contribution recorded successfully',
            'data': {
                'id': contribution.id,
                'member': contribution.member,
                'amount': contribution.amount,
                'contritype': contribution.contritype,
                'fund': contribution.fund,
                'paymentmethod': contribution.paymentmethod
            }
        }, status=status.HTTP_201_CREATED)

