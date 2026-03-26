import logging

import stripe
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.user import User

logger = logging.getLogger(__name__)

stripe.api_key = settings.stripe_api_key

class BillingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_customer(self, user: User) -> str:
        if user.stripe_customer_id:
            return user.stripe_customer_id

        customer = stripe.Customer.create(
            email=user.email,
            metadata={"user_id": str(user.id), "clerk_id": user.clerk_id}
        )
        user.stripe_customer_id = customer.id
        await self.db.commit()
        return customer.id

    async def create_checkout_session(self, user: User, success_url: str, cancel_url: str) -> str:
        customer_id = await self.get_or_create_customer(user)

        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[
                {
                    "price": settings.stripe_premium_price_id,
                    "quantity": 1,
                },
            ],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            subscription_data={
                "metadata": {"user_id": str(user.id)}
            }
        )
        return session.url

    async def get_invoices(self, user: User):
        if not user.stripe_customer_id:
            return []

        invoices = stripe.Invoice.list(customer=user.stripe_customer_id, limit=10)
        return [
            {
                "id": inv.id,
                "amount": inv.amount_paid / 100.0,
                "status": inv.status,
                "date": inv.created,
                "pdf_url": inv.invoice_pdf,
            }
            for inv in invoices
        ]

    async def handle_webhook(self, payload: bytes, sig_header: str):
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.stripe_webhook_secret
            )
        except ValueError as e:
            logger.error(f"Invalid payload: {e}")
            raise e
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {e}")
            raise e

        if event.type == "checkout.session.completed":
            session_obj = event.data.object
            user_id = session_obj.metadata.get("user_id")
            if user_id:
                from sqlalchemy import update

                from app.models.user import User
                await self.db.execute(
                    update(User)
                    .where(User.id == user_id)
                    .values(plan="premium", subscription_status="active", stripe_subscription_id=session_obj.subscription)
                )
                await self.db.commit()

        elif event.type == "customer.subscription.deleted":
            subscription = event.data.object
            from sqlalchemy import update

            from app.models.user import User
            await self.db.execute(
                update(User)
                .where(User.stripe_subscription_id == subscription.id)
                .values(plan="free", subscription_status="canceled")
            )
            await self.db.commit()

        return {"status": "success"}
