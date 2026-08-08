from io import BytesIO

from django.core.files.base import ContentFile
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


def _write_lines(pdf, lines, start_y=750):
    y = start_y
    for line in lines:
        if y < 60:
            pdf.showPage()
            y = 750
        pdf.drawString(50, y, str(line)[:110])
        y -= 18
    return y


def _bullet_lines(items):
    items = items or []
    if not items:
        return ["—"]
    return [f"- {item}" for item in items]


def generate_weekly_report_pdf(report):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    week = report.roadmap_week.week_number if report.roadmap_week else "?"
    score = (
        f"{report.overall_weekly_score} / 100"
        if report.overall_weekly_score is not None
        else "N/A"
    )
    lines = [
        "Weekly Performance Report",
        f"Intern: {report.intern.user.full_name}",
        f"Program: {report.program.title}",
        f"Week: {week}",
        f"Overall Weekly Score: {score}",
        "",
        "Performance Summary",
        report.performance_summary or "—",
        "",
        "Achievements",
        *_bullet_lines(report.achievements),
        "",
        "Learning Progress",
        report.learning_progress or "—",
        "",
        "Productivity Analysis",
        report.productivity_analysis or "—",
        "",
        "Recommended Focus Next Week",
        report.recommended_next_focus or "—",
        "",
        "Additional Mentor Notes",
        report.additional_mentor_notes or "—",
    ]
    _write_lines(pdf, lines)
    pdf.save()
    buffer.seek(0)
    filename = f"weekly-report-{report.id}.pdf"
    report.pdf_file.save(filename, ContentFile(buffer.read()), save=True)
    return report.pdf_file


def generate_final_summary_pdf(summary):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    score = (
        f"{summary.final_score} / 100"
        if summary.final_score is not None
        else "N/A"
    )
    lines = [
        "Final Internship Summary",
        f"Intern: {summary.intern.user.full_name}",
        f"Program: {summary.program.title}",
        f"Final Score: {score}",
        "",
        "Overall Performance Summary",
        summary.overall_performance_summary or "—",
        "",
        "Learning Journey",
        summary.learning_journey or "—",
        "",
        "Main Achievements",
        *_bullet_lines(summary.main_achievements),
        "",
        "Goal Achievement",
        summary.goal_achievement or "—",
        "",
        "Final Performance Summary",
        summary.final_performance_summary or "—",
        "",
        "Mentor Comments",
        summary.mentor_comments or "—",
        "",
        "Additional Mentor Notes",
        summary.additional_mentor_notes or "—",
    ]
    _write_lines(pdf, lines)
    pdf.save()
    buffer.seek(0)
    filename = f"final-summary-{summary.id}.pdf"
    summary.pdf_file.save(filename, ContentFile(buffer.read()), save=True)
    return summary.pdf_file
