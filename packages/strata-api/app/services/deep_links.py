class DeepLinkService:
    @staticmethod
    def generate_referral_link(provider_id: str, user_data: dict | None = None) -> str:
        """Generate a pre-filled referral link for a third-party provider.

        Not yet implemented — requires partner portal integrations.
        """
        raise NotImplementedError(
            "Referral link generation is not yet available. "
            "Partner portal integrations are under development."
        )
