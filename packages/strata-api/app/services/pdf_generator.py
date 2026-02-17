from datetime import datetime

from fpdf import FPDF

from app.models.action_intent import ActionIntent


class PDFGenerator:
    """Service to generate manifest PDFs for Action Intents."""

    def generate_action_manifest(self, intent: ActionIntent) -> bytes:
        pdf = FPDF()
        pdf.add_page()

        # Set colors
        # Emerald/Brand colors (approximate)
        emerald = (16, 185, 129)
        neutral_900 = (23, 23, 23)

        # Logo/Header
        pdf.set_fill_color(*emerald)
        pdf.rect(0, 0, 210, 40, "F")

        pdf.set_text_color(255, 255, 255)
        pdf.set_font("helvetica", "B", 24)
        pdf.cell(0, 20, "ClearMoney | Strata", 0, 1, "L")
        pdf.set_font("helvetica", "", 12)
        pdf.cell(0, 0, "Autonomous Action Layer Manifest", 0, 1, "L")

        # Reset text color
        pdf.set_text_color(*neutral_900)
        pdf.ln(30)

        # Intent Meta
        pdf.set_font("helvetica", "B", 10)
        pdf.cell(40, 8, "INTENT ID:", 0, 0)
        pdf.set_font("helvetica", "", 10)
        pdf.cell(0, 8, str(intent.id), 0, 1)

        pdf.set_font("helvetica", "B", 10)
        pdf.cell(40, 8, "GENERATED AT:", 0, 0)
        pdf.set_font("helvetica", "", 10)
        pdf.cell(0, 8, datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"), 0, 1)

        pdf.set_font("helvetica", "B", 10)
        pdf.cell(40, 8, "USER ID:", 0, 0)
        pdf.set_font("helvetica", "", 10)
        pdf.cell(0, 8, str(intent.user_id), 0, 1)

        pdf.ln(10)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(10)

        # Summary Section
        pdf.set_font("helvetica", "B", 14)
        pdf.cell(0, 10, intent.title, 0, 1)
        pdf.set_font("helvetica", "", 11)
        pdf.multi_cell(0, 6, intent.description)
        pdf.ln(10)

        # Instruction Grid
        pdf.set_fill_color(245, 245, 245)
        pdf.set_font("helvetica", "B", 12)
        pdf.cell(0, 10, "  Execution Instructions", 0, 1, fill=True)
        pdf.ln(2)

        pdf.set_font("helvetica", "", 10)
        for key, value in intent.payload.items():
            label = key.replace('_', ' ').upper()
            pdf.set_font("helvetica", "B", 9)
            pdf.cell(50, 8, f"  {label}:", 0, 0)
            pdf.set_font("helvetica", "", 10)
            pdf.cell(0, 8, str(value), 0, 1)

        pdf.ln(10)

        # Impact Section
        pdf.set_fill_color(240, 253, 244) # emerald-50
        pdf.set_font("helvetica", "B", 12)
        pdf.cell(0, 10, "  Estimated Economic Impact", 0, 1, fill=True)
        pdf.ln(2)

        pdf.set_font("helvetica", "", 10)
        for key, value in intent.impact_summary.items():
            label = key.replace('_', ' ').upper()
            pdf.set_font("helvetica", "B", 9)
            pdf.cell(50, 8, f"  {label}:", 0, 0)
            pdf.set_font("helvetica", "B", 10)
            pdf.set_text_color(5, 150, 105) # emerald-600
            pdf.cell(0, 8, str(value), 0, 1)
            pdf.set_text_color(*neutral_900)

        pdf.ln(20)

        # Decision Trace Link
        if intent.decision_trace_id:
            pdf.set_font("helvetica", "I", 9)
            pdf.cell(0, 10, f"Backed by Decision Trace: {intent.decision_trace_id}", 0, 1)

        # Footer / Legal
        pdf.set_y(-40)
        pdf.set_font("helvetica", "I", 8)
        pdf.set_text_color(120, 120, 120)
        pdf.multi_cell(0, 4, "LEGAL NOTICE: This manifest is a structured representation of user intent for financial optimization. Strata does not hold user funds. This document may be used to pre-fill official institutional forms. The user is responsible for final verification and signature at the receiving and delivering institutions.")

        # Convert to bytes
        return bytes(pdf.output())
