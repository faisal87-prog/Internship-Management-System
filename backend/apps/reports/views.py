from django.http import FileResponse, Http404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.reports.models import FinalInternshipSummary, WeeklyReport
from apps.reports.serializers import (
    FinalInternshipSummarySerializer,
    WeeklyReportSerializer,
)
from common.constants import AiContentStatus, Role
from permissions.roles import IsMentor
from services.pdf import generate_final_summary_pdf, generate_weekly_report_pdf
from services.weekly_score import refresh_weekly_report_score


class WeeklyReportViewSet(viewsets.ModelViewSet):
    serializer_class = WeeklyReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = WeeklyReport.objects.select_related(
            "intern__user",
            "program",
            "roadmap_week",
            "approved_by",
        )
        if user.role == Role.ADMIN:
            return qs
        if user.role == Role.MENTOR:
            return qs.filter(program__mentor=user)
        if user.role == Role.INTERN and hasattr(user, "intern_profile"):
            return qs.filter(
                intern=user.intern_profile,
                status=AiContentStatus.APPROVED,
            )
        return qs.none()

    def get_permissions(self):
        if self.action in {"create", "update", "partial_update", "destroy", "approve", "refresh_score"}:
            return [IsMentor()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        program = serializer.validated_data["program"]
        if program.mentor_id != self.request.user.id:
            raise PermissionDenied("Not your program.")
        serializer.save()

    def perform_update(self, serializer):
        report = self.get_object()
        if report.program.mentor_id != self.request.user.id:
            raise PermissionDenied("Not your report.")
        serializer.save()

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        report = self.get_object()
        if report.program.mentor_id != request.user.id:
            return Response({"detail": "Not your report."}, status=status.HTTP_403_FORBIDDEN)
        report.status = AiContentStatus.APPROVED
        report.approved_by = request.user
        from django.utils import timezone

        report.approved_at = timezone.now()
        refresh_weekly_report_score(report)
        generate_weekly_report_pdf(report)
        report.refresh_from_db()
        return Response(WeeklyReportSerializer(report, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def refresh_score(self, request, pk=None):
        report = self.get_object()
        if report.program.mentor_id != request.user.id:
            return Response({"detail": "Not your report."}, status=status.HTTP_403_FORBIDDEN)
        refresh_weekly_report_score(report)
        return Response(WeeklyReportSerializer(report, context={"request": request}).data)

    @action(detail=True, methods=["get"])
    def download_pdf(self, request, pk=None):
        report = self.get_object()
        if request.user.role == Role.INTERN and report.status != AiContentStatus.APPROVED:
            raise PermissionDenied("Only approved reports are available.")
        if not report.pdf_file:
            if report.status == AiContentStatus.APPROVED:
                generate_weekly_report_pdf(report)
            else:
                raise Http404("PDF not available.")
        return FileResponse(report.pdf_file.open("rb"), as_attachment=True, filename=report.pdf_file.name)


class FinalInternshipSummaryViewSet(viewsets.ModelViewSet):
    serializer_class = FinalInternshipSummarySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = FinalInternshipSummary.objects.select_related(
            "intern__user",
            "program",
            "approved_by",
        )
        if user.role == Role.ADMIN:
            return qs
        if user.role == Role.MENTOR:
            return qs.filter(program__mentor=user)
        if user.role == Role.INTERN and hasattr(user, "intern_profile"):
            return qs.filter(
                intern=user.intern_profile,
                status=AiContentStatus.APPROVED,
            )
        return qs.none()

    def get_permissions(self):
        if self.action in {"create", "update", "partial_update", "destroy", "approve"}:
            return [IsMentor()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        program = serializer.validated_data["program"]
        if program.mentor_id != self.request.user.id:
            raise PermissionDenied("Not your program.")
        serializer.save()

    def perform_update(self, serializer):
        summary = self.get_object()
        if summary.program.mentor_id != self.request.user.id:
            raise PermissionDenied("Not your summary.")
        serializer.save()

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        summary = self.get_object()
        if summary.program.mentor_id != request.user.id:
            return Response({"detail": "Not your summary."}, status=status.HTTP_403_FORBIDDEN)
        from django.utils import timezone

        summary.status = AiContentStatus.APPROVED
        summary.approved_by = request.user
        summary.approved_at = timezone.now()
        summary.save()
        generate_final_summary_pdf(summary)
        summary.refresh_from_db()
        return Response(
            FinalInternshipSummarySerializer(summary, context={"request": request}).data
        )

    @action(detail=True, methods=["get"])
    def download_pdf(self, request, pk=None):
        summary = self.get_object()
        if request.user.role == Role.INTERN and summary.status != AiContentStatus.APPROVED:
            raise PermissionDenied("Only approved summaries are available.")
        if not summary.pdf_file:
            if summary.status == AiContentStatus.APPROVED:
                generate_final_summary_pdf(summary)
            else:
                raise Http404("PDF not available.")
        return FileResponse(
            summary.pdf_file.open("rb"),
            as_attachment=True,
            filename=summary.pdf_file.name,
        )
