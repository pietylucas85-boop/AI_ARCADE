
import stripe
import os
from dotenv import load_dotenv

# Load keys
load_dotenv()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

def create_payment_link():
    print("Connecting to Stripe...")
    
    try:
        # 1. Create Product
        print("Creating 'Arcade AI VIP' Product...")
        product = stripe.Product.create(
            name="Arcade AI VIP",
            description="Unlimited Access, No Ads, God Mode AI.",
            images=["https://files.stripe.com/links/MDB8YWNjdF8xU2FyQjVIUGt5S3NzZGZifGZsX3Rlc3RfMVV2M3JzQ3lUQ3lUQ3lUQ3lUQ3lUQ3lU00Z7Q3lUQ3lU"] # Generic placeholder or need real URL
        )
        
        # 2. Create Price ($4.99 / Month)
        print("Setting Price to $4.99/mo...")
        price = stripe.Price.create(
            unit_amount=499,
            currency="usd",
            recurring={"interval": "month"},
            product=product.id,
        )
        
        # 3. Create Payment Link (With 3-day Trial)
        print("Generating Payment Link...")
        payment_link = stripe.PaymentLink.create(
            line_items=[{"price": price.id, "quantity": 1}],
            subscription_data={"trial_period_days": 3},
            after_completion={"type": "redirect", "redirect": {"url": "http://localhost:8080/index.html?vip=true"}}
        )
        
        print("\nSUCCESS! HERE IS YOUR PAYMENT LINK:")
        print(payment_link.url)
        return payment_link.url

    except Exception as e:
        print("\nERROR: Could not create link.")
        print(e)

if __name__ == "__main__":
    create_payment_link()
