# ⚡ HOMAATRI — REAL-TIME WEBSOCKETS & SSE PROTOCOL SPECIFICATION

**Document Version:** 1.0  
**Target Services:** Customer Live Order Tracking (`/order/tracking`), Admin Chat & Audit Stream (`/admin/chats`), Rider Route Updates (`/rider`).  
**Primary Engine:** Python FastAPI Server-Sent Events (SSE) + WebSockets.

---

## 1. Overview & Protocol Strategy

For real-time updates across the Homaatri platform:
- **Server-Sent Events (SSE)**: Used for one-way server-to-client streaming (e.g. Order Tracking updates for customers, Admin Chat Audit Streams).
- **WebSockets (WS)**: Used for bi-directional real-time communication (e.g. Admin HITL live chat messaging, Rider GPS coordinate tracking).

---

## 2. Event Channel Specifications

### A. Customer Order Tracking Channel (SSE)
- **Endpoint**: `GET /api/v1/orders/{order_id}/stream`
- **Headers**: `Accept: text/event-stream`, `Authorization: Bearer <jwt_token>`
- **Event Types**:

```json
// Event: order_status_updated
{
  "event": "order_status_updated",
  "data": {
    "order_id": "f51a2380-1092-4212-9124-a12398512398",
    "previous_status": "CONFIRMED",
    "current_status": "BATCHED",
    "timestamp": "2026-08-23T11:30:05Z",
    "message": "Your tiffin has been batched and the homemaker is preparing your meal."
  }
}
```

```json
// Event: rider_assigned
{
  "event": "rider_assigned",
  "data": {
    "order_id": "f51a2380-1092-4212-9124-a12398512398",
    "rider_name": "Ramesh Kumar",
    "vehicle_number": "MH-43-AZ-1234",
    "estimated_delivery_time": "12:15 PM"
  }
}
```

---

### B. Admin Chat & Audit Stream Channel (SSE / WS)
- **Endpoint**: `GET /api/admin/chats/stream`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Event Payload**:

```json
{
  "event": "chat_message_received",
  "data": {
    "message_id": "msg_90123840192",
    "customer_phone": "919876543210",
    "customer_name": "Dinesh Chandan",
    "channel": "WHATSAPP",
    "direction": "INBOUND",
    "content": "Is my lunch tiffin arriving before 12:30 PM?",
    "timestamp": "2026-08-23T11:45:10Z"
  }
}
```

---

### C. Rider GPS Location Tracking Channel (WebSocket)
- **Endpoint**: `WS /ws/v1/rider/location`
- **Payload Sent by Rider App (every 10 seconds)**:

```json
{
  "action": "update_location",
  "rider_id": "rdr_88291039",
  "latitude": 19.123456,
  "longitude": 73.012345,
  "heading": 185.5,
  "timestamp": "2026-08-23T12:00:15Z"
}
```
