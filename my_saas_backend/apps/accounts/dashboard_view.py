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

        from apps.clients.models import Client, Payment
        from apps.expenses.models import Expense

        today = date.today()
        first_of_month = today.replace(day=1)

        clients = Client.objects.filter(gym=gym)

        # ── Client stats ───────────────────────────────────────────────────────
        total_clients = clients.count()
        active_clients = clients.filter(status="active").count()
        expiring_clients = clients.filter(status="expiring")
        expired_clients = clients.filter(status="expired").count()
        new_this_month = clients.filter(join_date__gte=first_of_month).count()
        pt_clients = clients.filter(personal_training=True).count()

        # ── Revenue / expenses this month ──────────────────────────────────────
        monthly_revenue = (
            Payment.objects.filter(gym=gym, date__gte=first_of_month)
            .aggregate(total=Sum("amount"))["total"] or 0
        )
        monthly_expenses = (
            Expense.objects.filter(gym=gym, date__gte=first_of_month)
            .aggregate(total=Sum("amount"))["total"] or 0
        )

        # ── Expiring soon (within 7 days) ──────────────────────────────────────
        expiring_list = expiring_clients.values("id", "name", "phone", "expiry_date")[:10]

        # ── Activity feed (recent payments + new clients) ──────────────────────
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

        # ── Revenue chart — last 6 months ─────────────────────────────────────
        revenue_chart = []
        for i in range(5, -1, -1):
            month_start = (today.replace(day=1) - timedelta(days=i * 30)).replace(day=1)
            # Safe next-month calculation
            if month_start.month == 12:
                month_end = month_start.replace(year=month_start.year + 1, month=1, day=1)
            else:
                month_end = month_start.replace(month=month_start.month + 1, day=1)

            month_rev = (
                Payment.objects.filter(gym=gym, date__gte=month_start, date__lt=month_end)
                .aggregate(total=Sum("amount"))["total"] or 0
            )
            month_exp = (
                Expense.objects.filter(gym=gym, date__gte=month_start, date__lt=month_end)
                .aggregate(total=Sum("amount"))["total"] or 0
            )
            revenue_chart.append(
                {
                    "month": month_start.strftime("%b"),
                    "revenue": float(month_rev),
                    "expenses": float(month_exp),
                }
            )

        # ── Client growth chart — new clients per month for last 6 months ──────
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
            client_growth.append(
                {
                    "month": month_start.strftime("%b"),
                    "new": new_count,
                }
            )

        return Response(
            {
                "stats": {
                    "total_clients": total_clients,
                    "active_clients": active_clients,
                    "expired_clients": expired_clients,
                    "new_this_month": new_this_month,
                    "pt_clients": pt_clients,
                    "monthly_revenue": float(monthly_revenue),
                    "monthly_expenses": float(monthly_expenses),
                    "net_profit": float(monthly_revenue) - float(monthly_expenses),
                },
                "expiring_clients": list(expiring_list),
                "activity_feed": activity_feed[:7],
                "revenue_chart": revenue_chart,
                "client_growth": client_growth,   # ← new
            }
        )
