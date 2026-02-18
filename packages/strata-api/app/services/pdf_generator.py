from datetime import datetime
from fpdf import FPDF
from app.models.action_intent import ActionIntent, ActionIntentType

class Colors:
    EMERALD = (16, 185, 129)
    NEUTRAL_900 = (23, 23, 23)
    SLATE_500 = (100, 116, 139)
    SLATE_50 = (248, 250, 252)
    EMERALD_50 = (240, 253, 244)
    EMERALD_600 = (5, 150, 105)
    AMBER_50 = (255, 251, 235)

class PDFGenerator:
    """Service to generate manifest PDFs and specialized Switch Kits for Action Intents."""

    def generate_action_manifest(self, intent: ActionIntent) -> bytes:
        pdf = FPDF()
        pdf.add_page()

        # Header with specialized title
        title = "STRATA ACTION MANIFEST"
        if intent.intent_type == ActionIntentType.ACATS_TRANSFER:
            title = "SWITCH KIT: ACATS ROLLOVER"
        elif intent.intent_type == ActionIntentType.ACH_TRANSFER:
            title = "SWITCH KIT: ACH TRANSFER"

        # Background Banner
        pdf.set_fill_color(*Colors.EMERALD)
        pdf.rect(0, 0, 210, 45, "F")

        pdf.set_text_color(255, 255, 255)
        pdf.set_font("helvetica", "B", 24)
        pdf.set_xy(10, 15)
        pdf.cell(0, 10, "ClearMoney | Strata", 0, 1, "L")
        pdf.set_font("helvetica", "", 12)
        pdf.cell(0, 10, title, 0, 1, "L")

        # Reset text color
        pdf.set_text_color(*Colors.NEUTRAL_900)
        pdf.ln(25)

        # Intent Meta Grid
        pdf.set_font("helvetica", "B", 9)
        pdf.set_text_color(*Colors.SLATE_500)
        pdf.cell(40, 6, "INTENT IDENTIFIER", 0, 0)
        pdf.cell(60, 6, "STATUS", 0, 0)
        pdf.cell(0, 6, "GENERATED TIMESTAMP", 0, 1)

        pdf.set_text_color(*Colors.NEUTRAL_900)
        pdf.set_font("courier", "B", 10)
        pdf.cell(40, 8, str(intent.id)[:13].upper(), 0, 0)
        pdf.set_font("helvetica", "B", 10)
        pdf.cell(60, 8, intent.status.value.upper(), 0, 0)
        pdf.set_font("helvetica", "", 10)
        pdf.cell(0, 8, datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"), 0, 1)

        pdf.ln(5)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(10)

        # Summary & Description
        pdf.set_font("helvetica", "B", 16)
        pdf.cell(0, 10, intent.title, 0, 1)
        pdf.set_font("helvetica", "", 11)
        pdf.multi_cell(0, 6, intent.description)
        pdf.ln(10)

        # Data Pillar Section (The Core Details)
        pdf.set_fill_color(*Colors.SLATE_50)
        pdf.set_font("helvetica", "B", 12)
        pdf.cell(0, 12, "  Institutional Instruction Data", 0, 1, fill=True)
        pdf.ln(4)

        pdf.set_font("helvetica", "", 10)
        
        # Define preferred order for common keys to maintain logical grouping in the PDF
        preferred_order = [
            "source_institution", 
            "source_account_number", 
            "source_routing_number",
            "target_institution", 
            "target_account_number", 
            "target_routing_number",
            "amount"
        ]
        sorted_keys = sorted(
            intent.payload.keys(), 
            key=lambda x: (preferred_order.index(x) if x in preferred_order else 999, x)
        )

        for key in sorted_keys:
            value = intent.payload[key]
            label = key.replace('_', ' ').upper()
            pdf.set_font("helvetica", "B", 9)
            pdf.set_text_color(*Colors.SLATE_500)
            pdf.cell(60, 8, f"  {label}", 0, 0)
            
            pdf.set_text_color(*Colors.NEUTRAL_900)
            pdf.set_font("courier", "B", 11)
            pdf.cell(0, 8, str(value), 0, 1)
            pdf.set_font("helvetica", "", 10)

        pdf.ln(10)

        # Impact & Analysis Section
        pdf.set_fill_color(*Colors.EMERALD_50)
        pdf.set_font("helvetica", "B", 12)
        pdf.cell(0, 12, "  Estimated Economic Impact", 0, 1, fill=True)
        pdf.ln(4)

        for key, value in intent.impact_summary.items():
            label = key.replace('_', ' ').upper()
            pdf.set_font("helvetica", "B", 9)
            pdf.set_text_color(*Colors.SLATE_500)
            pdf.cell(60, 8, f"  {label}", 0, 0)
            
            pdf.set_text_color(*Colors.EMERALD_600)
            pdf.set_font("helvetica", "B", 11)
            pdf.cell(0, 8, f"+ {value}" if isinstance(value, (int, float)) and value > 0 else str(value), 0, 1)
            pdf.set_text_color(*Colors.NEUTRAL_900)

        # Ghost Navigation Verification
        if intent.execution_manifest and "steps" in intent.execution_manifest:
            pdf.ln(10)
            pdf.set_fill_color(*Colors.AMBER_50)
            pdf.set_font("helvetica", "B", 12)
            pdf.cell(0, 12, "  Step-by-Step Execution Guide", 0, 1, fill=True)
            pdf.ln(4)
            
            for step in intent.execution_manifest["steps"]:
                order = step.get("order", "?")
                label = step.get("label", "Instruction")
                instr = step.get("instruction", "")
                
                pdf.set_font("helvetica", "B", 10)
                pdf.cell(10, 7, f"{order}.", 0, 0)
                pdf.cell(0, 7, label, 0, 1)
                pdf.set_font("helvetica", "", 9)
                pdf.set_text_color(*Colors.SLATE_500)
                pdf.multi_cell(0, 5, f"    {instr}")
                pdf.ln(2)
                pdf.set_text_color(*Colors.NEUTRAL_900)

        # Footer / Legal
        pdf.set_y(-50)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)
        
        # Proof of Integrity
        if intent.decision_trace_id:
            pdf.set_font("courier", "I", 8)
            pdf.set_text_color(*Colors.SLATE_500)
            pdf.cell(0, 5, f"CRYPTO-TRACE: {intent.decision_trace_id}", 0, 1, "R")

        pdf.set_font("helvetica", "I", 8)
        pdf.set_text_color(120, 120, 120)
        pdf.multi_cell(0, 4, "LEGAL NOTICE: This document is a generated 'Switch Kit' manifest intended to assist the user in manual financial account portability. ClearMoney and the Strata Action Layer do not have direct custody of these funds. Final authorization and legal signature remain the sole responsibility of the account holder at the delivering and receiving institutions.")

        return bytes(pdf.output())
