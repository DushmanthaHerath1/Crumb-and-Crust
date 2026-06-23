import requests

url = "http://localhost:8000/api/webhooks/stripe"

# Test Case 1: First time webhook
payload_success = {
    "type": "checkout.session.completed",
    "data": {"object": {"id": "mock_sess_8"}},
}
print("\n--- Running Test 1: SUCCESS ---")
res1 = requests.post(url, json=payload_success)
print(f"Response: {res1.status_code} - {res1.text}")

# Test Case 2: Duplicate webhook (Idempotency)
print("\n--- Running Test 2: IDEMPOTENCY ---")
res2 = requests.post(url, json=payload_success)
print(f"Response: {res2.status_code} - {res2.text}")

# Test Case 3: Invalid Order
payload_invalid = {
    "type": "checkout.session.completed",
    "data": {"object": {"id": "mock_sess_invalid_999"}},
}
print("\n--- Running Test 3: ERROR ---")
res3 = requests.post(url, json=payload_invalid)
print(f"Response: {res3.status_code} - {res3.text}")
