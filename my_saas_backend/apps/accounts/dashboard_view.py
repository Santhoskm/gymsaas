# # apps/accounts/dashboard_view.py

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# from datetime import date, timedelta
# from django.db.models import Sum


# class DashboardView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         gym = request.user.gym
#         if not gym:
#             return Response({"error": "No gym associated with this user"}, status=400)

#         from apps.clients.models import Client, Payment, MembershipHistory
#         from apps.expenses.models import Expense

#         today = date.today()
#         first_of_month = today.replace(day=1)

#         clients = Client.objects.filter(gym=gym)

#         # ── Client stats ───────────────────────────────────────────────────────
#         total_clients = clients.count()
#         active_clients = clients.filter(status="active").count()
#         expiring_clients = clients.filter(status="expiring")
#         expired_clients = clients.filter(status="expired").count()
#         pt_clients = clients.filter(personal_training=True).count()

#         # New clients = first-time joins this month (join_date this month + first history is 'new')
#         new_joins_this_month = clients.filter(join_date__gte=first_of_month).count()

#         # Renewals/upgrades this month = history records this month excluding new enrollments
#         renewals_this_month = MembershipHistory.objects.filter(
#             gym=gym,
#             created_at__date__gte=first_of_month,
#             action__in=['renewal', 'upgrade'],
#         ).count()

#         # ── Revenue this month — payments collected this month ─────────────────
#         # Split into: new client revenue vs renewal/upgrade revenue
#         monthly_payments = Payment.objects.filter(gym=gym, date__gte=first_of_month)
#         monthly_revenue = monthly_payments.aggregate(total=Sum("amount"))["total"] or 0

#         # Revenue from new clients only (joined this month)
#         new_client_ids = clients.filter(join_date__gte=first_of_month).values_list('id', flat=True)
#         new_client_revenue = (
#             monthly_payments.filter(client_id__in=new_client_ids)
#             .aggregate(total=Sum("amount"))["total"] or 0
#         )
#         renewal_revenue = float(monthly_revenue) - float(new_client_revenue)

#         monthly_expenses = (
#             Expense.objects.filter(gym=gym, date__gte=first_of_month)
#             .aggregate(total=Sum("amount"))["total"] or 0
#         )

#         # ── Expiring soon (within 7 days) ──────────────────────────────────────
#         expiring_list = expiring_clients.values("id", "name", "phone", "expiry_date")[:10]

#         # ── Activity feed (recent payments + new clients) ──────────────────────
#         recent_payments = (
#             Payment.objects.filter(gym=gym)
#             .select_related("client")
#             .order_by("-created_at")[:5]
#         )
#         activity_feed = [
#             {
#                 "type": "payment",
#                 "message": f"{p.client.name} paid ₹{int(p.amount)} ({p.method.upper()})",
#                 "time": p.created_at.strftime("%d %b"),
#                 "icon": "💰",
#             }
#             for p in recent_payments
#         ]
#         recent_clients = clients.order_by("-created_at")[:5]
#         for c in recent_clients:
#             activity_feed.append(
#                 {
#                     "type": "new_client",
#                     "message": f"{c.name} joined",
#                     "time": c.created_at.strftime("%d %b"),
#                     "icon": "👤",
#                 }
#             )

#         # ── Revenue chart — last 6 months (split new vs renewal) ──────────────
#         revenue_chart = []
#         for i in range(5, -1, -1):
#             month_start = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
#             if month_start.month == 12:
#                 month_end = month_start.replace(year=month_start.year + 1, month=1, day=1)
#             else:
#                 month_end = month_start.replace(month=month_start.month + 1, day=1)

#             month_payments = Payment.objects.filter(gym=gym, date__gte=month_start, date__lt=month_end)
#             month_rev = month_payments.aggregate(total=Sum("amount"))["total"] or 0

#             # New client revenue for this month
#             month_new_ids = clients.filter(
#                 join_date__gte=month_start, join_date__lt=month_end
#             ).values_list('id', flat=True)
#             month_new_rev = (
#                 month_payments.filter(client_id__in=month_new_ids)
#                 .aggregate(total=Sum("amount"))["total"] or 0
#             )
#             month_renewal_rev = float(month_rev) - float(month_new_rev)

#             month_exp = (
#                 Expense.objects.filter(gym=gym, date__gte=month_start, date__lt=month_end)
#                 .aggregate(total=Sum("amount"))["total"] or 0
#             )
#             revenue_chart.append(
#                 {
#                     "month": month_start.strftime("%b"),
#                     "revenue": float(month_rev),
#                     "new_revenue": float(month_new_rev),
#                     "renewal_revenue": float(month_renewal_rev),
#                     "expenses": float(month_exp),
#                 }
#             )

#         # ── Client growth chart — new + renewals per month ─────────────────────
#         client_growth = []
#         for i in range(5, -1, -1):
#             month_start = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
#             if month_start.month == 12:
#                 month_end = month_start.replace(year=month_start.year + 1, month=1, day=1)
#             else:
#                 month_end = month_start.replace(month=month_start.month + 1, day=1)

#             new_count = clients.filter(
#                 join_date__gte=month_start, join_date__lt=month_end
#             ).count()
#             renewal_count = MembershipHistory.objects.filter(
#                 gym=gym,
#                 created_at__date__gte=month_start,
#                 created_at__date__lt=month_end,
#                 action__in=['renewal', 'upgrade'],
#             ).count()
#             client_growth.append(
#                 {
#                     "month": month_start.strftime("%b"),
#                     "new": new_count,
#                     "renewals": renewal_count,
#                 }
#             )

#         return Response(
#             {
#                 "stats": {
#                     "total_clients": total_clients,
#                     "active_clients": active_clients,
#                     "expired_clients": expired_clients,
#                     "new_this_month": new_joins_this_month,
#                     "renewals_this_month": renewals_this_month,
#                     "pt_clients": pt_clients,
#                     "monthly_revenue": float(monthly_revenue),
#                     "new_client_revenue": float(new_client_revenue),
#                     "renewal_revenue": float(renewal_revenue),
#                     "monthly_expenses": float(monthly_expenses),
#                     "net_profit": float(monthly_revenue) - float(monthly_expenses),
#                 },
#                 "expiring_clients": list(expiring_list),
#                 "activity_feed": activity_feed[:7],
#                 "revenue_chart": revenue_chart,
#                 "client_growth": client_growth,
#             }
#         )
# apps/accounts/dashboard_view.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import date, timedelta
from django.db.models import Sum


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        gym = request.user.gym
        if not gym:
            return Response({"error": "No gym associated with this user"}, status=400)

        from apps.clients.models import Client, Payment, MembershipHistory
        from apps.expenses.models import Expense

        today = date.today()
        first_of_month = today.replace(day=1)

        clients = Client.objects.filter(gym=gym)

        # ── Client stats ───────────────────────────────────────────────────────
        total_clients = clients.count()
        active_clients = clients.filter(status="active").count()
        expiring_clients = clients.filter(status="expiring")
        expired_clients = clients.filter(status="expired").count()
        pt_clients = clients.filter(personal_training=True).count()

        new_joins_this_month = clients.filter(join_date__gte=first_of_month).count()

        renewals_this_month = MembershipHistory.objects.filter(
            gym=gym,
            created_at__date__gte=first_of_month,
            action__in=['renewal', 'upgrade', 'addon'],
        ).count()

        # ── Revenue this month — uses recognized_month, NOT payment date ───────
        # This means:
        #   - A 3-month package paid in June shows revenue in August (expiry month)
        #   - A PT add-on purchased in July shows revenue in July
        #   - If a client paid nothing extra, they don't show in this month's revenue
        monthly_payments = Payment.objects.filter(
            gym=gym,
            recognized_month__gte=first_of_month,
            recognized_month__lt=first_of_month.replace(
                month=first_of_month.month % 12 + 1,
                year=first_of_month.year + (1 if first_of_month.month == 12 else 0)
            ) if first_of_month.month != 12 else first_of_month.replace(year=first_of_month.year + 1, month=1),
        )
        monthly_revenue = monthly_payments.aggregate(total=Sum("amount"))["total"] or 0

        # Split: new client revenue vs renewal/add-on revenue
        new_client_ids = clients.filter(join_date__gte=first_of_month).values_list('id', flat=True)
        new_client_revenue = (
            monthly_payments.filter(client_id__in=new_client_ids)
            .aggregate(total=Sum("amount"))["total"] or 0
        )
        renewal_revenue = float(monthly_revenue) - float(new_client_revenue)

        monthly_expenses = (
            Expense.objects.filter(gym=gym, date__gte=first_of_month)
            .aggregate(total=Sum("amount"))["total"] or 0
        )

        # ── Expiring soon ──────────────────────────────────────────────────────
        expiring_list = expiring_clients.values("id", "name", "phone", "expiry_date")[:10]

        # ── Activity feed ──────────────────────────────────────────────────────
        recent_payments = (
            Payment.objects.filter(gym=gym)
            .select_related("client")
            .order_by("-created_at")[:5]
        )
        activity_feed = [
            {
                "type": "payment",
                "message": f"{p.client.name} paid ₹{int(p.amount)} ({p.method.upper()})",
                "time": p.created_at.strftime("%d %b"),
                "icon": "💰",
            }
            for p in recent_payments
        ]
        recent_clients = clients.order_by("-created_at")[:5]
        for c in recent_clients:
            activity_feed.append(
                {
                    "type": "new_client",
                    "message": f"{c.name} joined",
                    "time": c.created_at.strftime("%d %b"),
                    "icon": "👤",
                }
            )

        # ── Revenue chart — last 6 months using recognized_month ──────────────
        revenue_chart = []
        for i in range(5, -1, -1):
            month_start = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
            if month_start.month == 12:
                month_end = month_start.replace(year=month_start.year + 1, month=1, day=1)
            else:
                month_end = month_start.replace(month=month_start.month + 1, day=1)

            # Revenue that is ATTRIBUTED to this month (not necessarily paid this month)
            month_payments = Payment.objects.filter(
                gym=gym,
                recognized_month__gte=month_start,
                recognized_month__lt=month_end,
            )
            month_rev = month_payments.aggregate(total=Sum("amount"))["total"] or 0

            # New client revenue vs renewal/add-on
            month_new_ids = clients.filter(
                join_date__gte=month_start, join_date__lt=month_end
            ).values_list('id', flat=True)
            month_new_rev = (
                month_payments.filter(client_id__in=month_new_ids)
                .aggregate(total=Sum("amount"))["total"] or 0
            )
            month_renewal_rev = float(month_rev) - float(month_new_rev)

            month_exp = (
                Expense.objects.filter(gym=gym, date__gte=month_start, date__lt=month_end)
                .aggregate(total=Sum("amount"))["total"] or 0
            )
            revenue_chart.append(
                {
                    "month": month_start.strftime("%b"),
                    "revenue": float(month_rev),
                    "new_revenue": float(month_new_rev),
                    "renewal_revenue": float(month_renewal_rev),
                    "expenses": float(month_exp),
                }
            )

        # ── Client growth chart ────────────────────────────────────────────────
        client_growth = []
        for i in range(5, -1, -1):
            month_start = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
            if month_start.month == 12:
                month_end = month_start.replace(year=month_start.year + 1, month=1, day=1)
            else:
                month_end = month_start.replace(month=month_start.month + 1, day=1)

            new_count = clients.filter(
                join_date__gte=month_start, join_date__lt=month_end
            ).count()
            renewal_count = MembershipHistory.objects.filter(
                gym=gym,
                created_at__date__gte=month_start,
                created_at__date__lt=month_end,
                action__in=['renewal', 'upgrade', 'addon'],
            ).count()
            client_growth.append(
                {
                    "month": month_start.strftime("%b"),
                    "new": new_count,
                    "renewals": renewal_count,
                }
            )

        return Response(
            {
                "stats": {
                    "total_clients": total_clients,
                    "active_clients": active_clients,
                    "expired_clients": expired_clients,
                    "new_this_month": new_joins_this_month,
                    "renewals_this_month": renewals_this_month,
                    "pt_clients": pt_clients,
                    "monthly_revenue": float(monthly_revenue),
                    "new_client_revenue": float(new_client_revenue),
                    "renewal_revenue": float(renewal_revenue),
                    "monthly_expenses": float(monthly_expenses),
                    "net_profit": float(monthly_revenue) - float(monthly_expenses),
                },
                "expiring_clients": list(expiring_list),
                "activity_feed": activity_feed[:7],
                "revenue_chart": revenue_chart,
                "client_growth": client_growth,
            }
        )