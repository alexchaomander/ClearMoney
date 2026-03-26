import logging
import json
from datetime import datetime
from typing import Dict, Any

from app.services.llm_provider import ProviderFactory

logger = logging.getLogger(__name__)

class NarrativeService:
    @staticmethod
    async def generate_briefing_narrative(context: Dict[str, Any], analysis_metrics: Dict[str, Any]) -> str:
        provider = ProviderFactory.get_provider()
        
        system_prompt = (
            "You are ClearMoney's AI Chief of Staff. Your goal is to analyze the user's financial context "
            "and their latest portfolio/health metrics to write a highly concise, action-oriented briefing narrative. "
            "Do NOT include greetings or sign-offs. Use markdown styling, output only the narrative text. "
            "Focus on specific anomalies (e.g. cash drag, concentration risk, tax drag) or strong organic savings trends."
        )
        
        # Serialize only the vital numeric facts to prevent token bloat
        metrics = context.get("portfolio_metrics", {})
        context_summary = {
            "net_worth": metrics.get("net_worth"),
            "total_cash": metrics.get("total_cash_value"),
            "total_debt": metrics.get("total_debt_value"),
            "runway_months": metrics.get("runway_months")
        }
        
        user_prompt = f"""
Financial Context:
{json.dumps(context_summary, indent=2)}

Latest Analysis Metrics:
{json.dumps(analysis_metrics, default=str, indent=2)}

Current Date: {datetime.utcnow().strftime('%Y-%m-%d')}

Please write a 2-3 paragraph analytical briefing based on these metrics.
"""
        
        try:
            narrative = await provider.generate_narrative(system_prompt, user_prompt)
            return narrative.strip()
        except Exception as e:
            logger.error(f"Error generating narrative: {e}")
            return "Unable to generate narrative at this time due to an AI provider disruption."
