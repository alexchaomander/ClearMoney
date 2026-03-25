import json
import logging
from typing import Any

from app.core.config import settings
from app.services.agent_runtime import AgentRuntime

logger = logging.getLogger(__name__)

# Categories we want the LLM to map to
STANDARD_CATEGORIES = [
    "food_and_drink",
    "shopping",
    "transportation",
    "housing",
    "utilities",
    "healthcare",
    "entertainment",
    "personal_care",
    "education",
    "travel",
    "income",
    "transfer",
    "uncategorized"
]

SYSTEM_PROMPT = """You are a financial data categorization assistant.
Your job is to take raw, fragmented bank transaction descriptions and output a clean merchant name and a standardized category.
The standardized categories you can choose from are: {categories}.
If you cannot determine a category, use 'uncategorized'.

You will be given a list of raw transaction strings. You must return a JSON array of objects with exactly the same length and order.
Each object must have the following keys:
- "raw_name": The exact raw string you were given.
- "clean_merchant_name": The extracted, clean name of the merchant (e.g., "UBER EATS 1234" -> "Uber Eats", "AMZN MKTP US*H28" -> "Amazon"). If it's a person-to-person transfer, return the person's name if identifiable.
- "category": One of the exact standardized categories.
"""

class MerchantCategorizationService:
    def __init__(self):
        self.runtime = AgentRuntime()

    async def categorize_transactions(self, raw_names: list[str]) -> dict[str, dict[str, str]]:
        """
        Batch categorizes a list of raw transaction names.
        Returns a mapping from raw_name -> {"clean_merchant_name": ..., "category": ...}
        """
        if not raw_names:
            return {}

        # Deduplicate to save tokens
        unique_names = list(set(raw_names))
        
        # If there are too many, batching would be needed in production. 
        # For MVP, we'll process up to 50 at a time.
        results = {}
        batch_size = 50
        
        for i in range(0, len(unique_names), batch_size):
            batch = unique_names[i:i + batch_size]
            prompt = "Please categorize the following transaction descriptions:\n"
            for name in batch:
                prompt += f"- {name}\n"

            try:
                response = await self.runtime.create_message(
                    model=settings.advisor_model,
                    max_tokens=4000,
                    system=SYSTEM_PROMPT.format(categories=", ".join(STANDARD_CATEGORIES)),
                    messages=[{"role": "user", "content": prompt}],
                    tools=[{
                        "name": "submit_categorization",
                        "description": "Submit the cleaned merchant names and categories",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "categorizations": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "raw_name": {"type": "string"},
                                            "clean_merchant_name": {"type": "string"},
                                            "category": {"type": "string", "enum": STANDARD_CATEGORIES}
                                        },
                                        "required": ["raw_name", "clean_merchant_name", "category"]
                                    }
                                }
                            },
                            "required": ["categorizations"]
                        }
                    }]
                )
                
                # Extract the tool call
                content = response.get("content", [])
                for block in content:
                    if block.get("type") == "tool_use" and block.get("name") == "submit_categorization":
                        inputs = block.get("input", {})
                        categorizations = inputs.get("categorizations", [])
                        for cat in categorizations:
                            results[cat["raw_name"]] = {
                                "clean_merchant_name": cat["clean_merchant_name"],
                                "category": cat["category"]
                            }
            except Exception as e:
                logger.error(f"Failed to categorize batch: {e}")
                # Provide fallbacks
                for name in batch:
                    results[name] = {
                        "clean_merchant_name": name.title()[:50],  # naive fallback
                        "category": "uncategorized"
                    }
                    
        return results

merchant_categorization_service = MerchantCategorizationService()
