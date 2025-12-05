
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import jwt
import stripe
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
# STRIPE LIVE KEYS (Loaded securely)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")
SECRET_KEY = "super_secret_arcade_key"

# Mock Database
users_db = {} 
subscriptions_db = {}

class UserRegister(BaseModel):
    email: str
    password: str

class SubscriptionPlan(BaseModel):
    plan_id: str = "arcade_vip_monthly"
    price: float = 4.99
    features: list = ["no_ads", "unlimited_play", "pro_hints"]

@app.post("/auth/register")
def register(user: UserRegister):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    users_db[user.email] = {"password": user.password, "id": len(users_db)+1}
    return {"status": "created", "user_id": users_db[user.email]["id"]}

@app.post("/billing/start_trial")
def start_trial(email: str, card_token: str):
    """
    REAL STRIPE INTEGRATION: Starts a subscription with 3-day trial.
    """
    if email not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        # 1. Create Customer
        customer = stripe.Customer.create(
            email=email,
            source=card_token # Token from frontend (Stripe Elements)
        )
        
        # 2. Create Product/Price (Dynamic or Pre-defined)
        # For this quick integration, we use inline price data.
        # In prod, define Product in Dashboard.
        
        # 3. Create Subscription with Trial
        sub = stripe.Subscription.create(
            customer=customer.id,
            items=[{"price_data": {
                "currency": "usd",
                "product_data": {"name": "Arcade VIP Access"},
                "unit_amount": 499, # $4.99
                "recurring": {"interval": "month"}
            }}],
            trial_period_days=3,
            payment_settings={"save_default_payment_method": "on_subscription"}
        )
        
        subscriptions_db[email] = {
            "status": sub.status,
            "stripe_sub_id": sub.id,
            "stripe_cust_id": customer.id,
            "trial_end": datetime.fromtimestamp(sub.trial_end).isoformat() if sub.trial_end else None,
            "plan": "arcade_vip_monthly"
        }
        
        return {
            "status": "success",
            "message": "Stripe Trial Active",
            "trial_end": subscriptions_db[email]["trial_end"]
        }

    except stripe.error.StripeError as e:
         raise HTTPException(status_code=400, detail=str(e))

@app.get("/access/check")
def check_access(email: str):
    """
    The Gatekeeper. Games call this ensuring user pays up.
    """
    sub = subscriptions_db.get(email)
    if not sub:
        return {"access": "free_tier", "ads": True}
        
    # Check if trial expired and payment failed (logic omitted for mock)
    return {"access": "vip", "ads": False, "features": ["god_mode_ai", "infinite_wordle"]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8090)
