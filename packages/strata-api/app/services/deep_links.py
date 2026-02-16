import uuid

class DeepLinkService:
    @staticmethod
    def generate_referral_link(provider_id: str, user_data: dict = None) -> str:
        """
        Generate a pre-filled referral link for a third-party provider.
        High-level placeholder.
        """
        base_url = f"https://partner-portal.com/apply/{provider_id}"
        if user_data:
            # In a real scenario, we'd encrypt or encode user_data as query params
            return f"{base_url}?prefill=true&token={uuid.uuid4().hex}"
        return base_url
