#!/usr/bin/env python3
"""
1AA Automated WhatsApp Catalog Broadcaster
Uses the official Meta WhatsApp Business Cloud API.
Free Tier: 1,000 service conversations per month.
No third-party fees, official verified business delivery, zero ban risk.
"""

import os
import sys
import json
import urllib.request
import urllib.parse
from datetime import datetime

# ==========================================
# CONFIGURATION
# Set these as environment variables or update below:
# ==========================================
WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN", "YOUR_META_WHATSAPP_ACCESS_TOKEN")
PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID", "YOUR_WHATSAPP_PHONE_NUMBER_ID")
API_VERSION = "v20.0"

# Sample Buyer Phone Numbers in E.164 format (with 91 for India)
BUYER_LIST = [
    # "917406231167",
]

def load_products_from_catalog():
    """Extract sample high margin products for broadcast"""
    return [
        {
            "name": "Bubble Gun 23 Hole Automatic Gatling (Assorted)",
            "sku": "wh/195_89531_bubble_gun_23_hole_assorted_color_at84",
            "base_cost": 84,
            "fair_price": 184,
            "market_price": 349,
            "margin": 165
        },
        {
            "name": "Air Gun Shooting Game Toy Set",
            "sku": "wh/196_76949_air_gun_shooting_game_toy_at129",
            "base_cost": 129,
            "fair_price": 229,
            "market_price": 499,
            "margin": 270
        },
        {
            "name": "Soft Bullet 20 Pcs Dart Pack",
            "sku": "wh/197_90445_soft_bullet_20_pcs_dart_pack_at65",
            "base_cost": 65,
            "fair_price": 165,
            "market_price": 299,
            "margin": 134
        }
    ]

def compose_broadcast_message(products):
    today = datetime.now().strftime("%d %b %Y")
    lines = [
        f"🔥 *1AA DAILY FACTORY WHOLESALE DISPATCH — {today}* 🔥",
        "Direct Factory Sourcing • Transparent Cost + ₹100 Flat Margin • Mysore QA",
        "",
        "📦 *FEATURED HIGH-MARGIN PICKS FOR RESELLERS:*",
    ]
    
    for i, p in enumerate(products, 1):
        lines.append(f"\n{i}. *{p['name']}*")
        lines.append(f"   • 1AA Price: *₹{p['fair_price']}* (Factory Cost: ₹{p['base_cost']})")
        lines.append(f"   • Retail MRP: ~₹{p['market_price']}~ (*Profit: ₹{p['margin']} / piece*)")
    
    lines.extend([
        "",
        "━━━━━━━━━━━━━━━━━━━━",
        "🛒 *Live Catalog & Instant Cart Booking:*",
        "https://1aa-store.vercel.app/",
        "",
        "📍 *Mysore Central Dispatch Facility:*",
        "Rajendra Nagar, Kesare, Mysore - 570007",
        "☎️ *Hotline / WhatsApp Booking:*",
        "+91 74062 31167 (Abdul Darvesh)",
        "",
        "⚡ *Reply 'ORDER' to book sample cartons or request price sheet.*"
    ])
    return "\n".join(lines)

def send_whatsapp_message(to_number, message_text):
    url = f"https://graph.facebook.com/{API_VERSION}/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_number,
        "type": "text",
        "text": {
            "preview_url": True,
            "body": message_text
        }
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"✅ Dispatched to {to_number}: Message ID {data.get('messages', [{}])[0].get('id')}")
            return True
    except Exception as e:
        print(f"❌ Error sending to {to_number}: {e}")
        return False

def main():
    print("=" * 60)
    print("1AA WhatsApp Automated Broadcaster Engine")
    print("=" * 60)
    
    products = load_products_from_catalog()
    message = compose_broadcast_message(products)
    
    print("\n--- Broadcast Payload Preview ---")
    print(message)
    print("-" * 60)
    
    if not BUYER_LIST or WHATSAPP_TOKEN == "YOUR_META_WHATSAPP_ACCESS_TOKEN":
        print("\nℹ️  To trigger live broadcast:")
        print("1. Set WHATSAPP_TOKEN and PHONE_NUMBER_ID")
        print("2. Add buyer numbers to BUYER_LIST")
        print("3. Run: python3 scripts/whatsapp_cloud_broadcaster.py")
        return
        
    print(f"\nBroadcasting to {len(BUYER_LIST)} subscribers...")
    success_count = 0
    for phone in BUYER_LIST:
        if send_whatsapp_message(phone, message):
            success_count += 1
            
    print(f"\nCompleted: {success_count}/{len(BUYER_LIST)} messages sent successfully.")

if __name__ == "__main__":
    main()
