import hmac
import hashlib
from fastapi import Request, HTTPException, status, Header
from backend.core.config import settings

async def verify_carrier_hmac_signature(
    request: Request,
    x_carrier_signature: str = Header(None, alias="X-Carrier-Signature"),
    x_hub_signature_256: str = Header(None, alias="X-Hub-Signature-256")
) -> bytes:
    """
    Validates HMAC SHA-256 signature on incoming carrier webhooks.
    Accepts signature either via 'X-Carrier-Signature' or 'X-Hub-Signature-256' headers.
    Returns the verified raw request body bytes for downstream processing.
    """
    signature = x_carrier_signature or x_hub_signature_256
    
    if not signature:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing required HMAC security signature header ('X-Carrier-Signature' or 'X-Hub-Signature-256')"
        )
    
    # Read raw body bytes
    body_bytes = await request.body()
    
    # Compute expected HMAC SHA-256 digest
    secret_bytes = settings.WEBHOOK_SECRET.encode("utf-8")
    expected_hmac = hmac.new(secret_bytes, body_bytes, hashlib.sha256).hexdigest()
    
    # Clean signature in case it has 'sha256=' prefix (common in GitHub/3PL webhooks)
    provided_signature = signature.replace("sha256=", "").strip()
    
    # Use constant-time comparison to guard against timing attacks
    if not hmac.compare_digest(expected_hmac, provided_signature):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid HMAC SHA-256 signature: carrier authentication failed"
        )
        
    return body_bytes
