from django.contrib import admin

from apps.reports.models import FinalInternshipSummary, WeeklyReport


@admin.register(WeeklyReport)
class WeeklyReportAdmin(admin.ModelAdmin):
    list_display = ("intern", "program", "status", "overall_weekly_score", "approved_at")
    list_filter = ("status",)
    search_fields = ("intern__user__full_name", "program__title")


@admin.register(FinalInternshipSummary)
class FinalInternshipSummaryAdmin(admin.ModelAdmin):
    list_display = ("intern", "program", "status", "final_score", "approved_at")
    list_filter = ("status",)
    search_fields = ("intern__user__full_name", "program__title")
