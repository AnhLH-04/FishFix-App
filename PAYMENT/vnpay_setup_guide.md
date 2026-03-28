# VNPAY Setup Guide (FishFix BE + Mobile App)

## Scope
- Use VNPAY as redirect checkout from mobile app.
- Backend is source of truth for payment status.
- Payment confirm must come from VNPAY callback/IPN to backend.

## Official references
- PAY API docs: https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html
- Sandbox intro: https://sandbox.vnpayment.vn/apis/docs/gioi-thieu/
- Hash/sign update notes: https://sandbox.vnpayment.vn/apis/docs/chuyen-doi-thuat-toan/changeTypeHash.html

## 1) Register sandbox merchant
1. Open: http://sandbox.vnpayment.vn/devreg/
2. Register merchant account.
3. Receive:
- `vnp_TmnCode`
- `vnp_HashSecret`

Sandbox base URLs:
- Checkout: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
- Query API: `https://sandbox.vnpayment.vn/merchant_webapi/api/transaction`

## 2) Configure backend
Set secrets in env/secret store (do not commit real values).

```bash
VnPay__TmnCode=YOUR_VNPAY_TMN_CODE
VnPay__HashSecret=YOUR_VNPAY_HASH_SECRET
VnPay__PayUrl=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VnPay__ReturnUrl=https://<your-domain>/api/payments/vnpay/return
VnPay__Version=2.1.0
VnPay__Command=pay
VnPay__CurrCode=VND
VnPay__Locale=vn
VnPay__OrderType=other
VnPay__TimeZone=SE Asia Standard Time
```

Current sample config path:
- `src/Host.Api/appsettings.json.example`

## 3) Endpoints used by current backend
- Create VNPAY payment (auth): `POST /api/bookings/{bookingId}/payments`
- IPN callback (allow anonymous): `GET /api/payments/vnpay/ipn`
- Return callback (allow anonymous): `GET /api/payments/vnpay/return`
- Query payment status (auth): `GET /api/payments/{paymentId}`

## 4) Mobile flow
1. App calls create payment API with `method = VNPAY`.
2. Backend returns `checkoutUrl`.
3. App opens `checkoutUrl` in browser/webview.
4. VNPAY calls backend IPN/return.
5. Backend verifies signature and updates payment + booking.
6. Backend can redirect to app deep link if `clientContext.appScheme` was sent.
7. App polls `GET /api/payments/{paymentId}` until terminal status.

Deep link output from backend return flow:
- `fishfix://payment-result?paymentId=<paymentId>`

## 5) Signature verification rules
For return/IPN query params:
1. Remove `vnp_SecureHash` and `vnp_SecureHashType`.
2. Sort by key ascending.
3. Build hash data string exactly as VNPAY spec.
4. HMAC SHA512 using `VnPay:HashSecret`.
5. Compare with incoming `vnp_SecureHash`.

Consider success only when:
- signature is valid
- `vnp_ResponseCode == "00"`
- `vnp_TransactionStatus == "00"`

## 6) Idempotency rules
- Match by internal `orderCode` (`vnp_TxnRef`) and provider transaction id.
- If callback is replayed, do not reconfirm booking/payment.
- Return success response quickly after safe processing.

## 7) Sandbox test checklist
1. Start backend with sandbox config.
2. Create booking, call payment API, open `checkoutUrl`.
3. Complete payment on sandbox.
4. Verify:
- Payment becomes `SUCCEEDED`
- Booking becomes `confirmed`
5. Replay callback URL manually and verify no duplicate update.
6. Cancel payment and verify `FAILED` or `CANCELLED` path.
7. Wait past TTL and verify payment can be expired by worker.

## 8) Common errors
- Invalid signature:
- Wrong `HashSecret` or wrong hash-data sort/build.
- Callback not reachable:
- Public HTTPS URL not accessible from VNPAY.
- Payment stuck pending:
- IPN not delivered or DB migration/background worker issue.

## 9) Production go-live checklist
1. Sign production contract with VNPAY.
2. Replace only credentials/URLs in env for production.
3. Keep separate sandbox/prod secrets.
4. Enable structured logs with masking.
5. Monitor:
- callback errors
- duplicate callback rate
- pending timeout rate

## Related docs
- App integration: `docs/PAYMENT/mobile_payment_app_guide.md`
- SePay setup: `docs/PAYMENT/sepay_setup_guide.md`
