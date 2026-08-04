# Link Structure & API Reference for inv.nalu.vn

## Overview

Calnalu và inv.nalu.vn chia sẻ **cùng PostgreSQL** (`solar_calculator`). inv.nalu.vn chỉ **SELECT** trực tiếp, không gọi API Calnalu (trừ trường hợp chốt quote).

---

## 1. Share Link Format (Calculator State) — Compact Array

Dùng để chia sẻ cấu hình calculator (survey + items). Format **mảng thứ tự**, cả 2 bên đồng ý trước.

**Format:**
```
https://inv.nalu.vn/?data={base64_encoded_array}
```

### Payload Structure (Array)
```json
[survey_array, items_array]
```

### Encoding
```js
const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
const url = `${INV_NALU_URL}/?data=${encodeURIComponent(encoded)}`
```

### Decoding
```js
const decoded = JSON.parse(decodeURIComponent(escape(atob(raw))))
// decoded = [[...survey], [...items]]
```

---

### Survey Array (14 elements, positional)

| Index | Field | Values |
|-------|-------|--------|
| 0 | electricityType | `1` = residential, `2` = business |
| 1 | inputType | `1` = bill, `2` = kwh (residential only; `0` for business) |
| 2 | amount | billAmount (VND) if residential+bill, kwhUsage if residential+kwh, `0` if business |
| 3 | daytimeUsage | 0–100 (%) — residential only (`0` for business) |
| 4 | tilt | degrees (số thực) |
| 5 | azimuth | degrees (số thực) |
| 6 | storage | `0` = no, `1` = yes, `2` = pending |
| 7 | phase | `1` = 1-phase, `2` = 3-phase |
| 8 | inverterFactory | `0` = default, `1` = Deye, `2` = Sungrow, `3` = SMA, `4` = Solaredge, `5` = Fronius, `6` = Lumentree, `7` = Goodwe, `8` = Growatt, `9` = Huawei |
| 9 | latitude | số thực |
| 10 | longitude | số thực |
| 11 | businessNormalKwh | business only (`0` for residential) |
| 12 | businessPeakKwh | business only (`0` for residential) |
| 13 | businessOffpeakKwh | business only (`0` for residential) |

**Ví dụ (residential, bill):**
```json
[1, 1, 1500000, 50, 30, 180, 1, 1, 1, 11.533486, 106.891618, 0, 0, 0]
```

**Ví dụ (business):**
```json
[2, 0, 0, 0, 25, 180, 0, 2, 1, 10.774797, 108.203628, 350, 200, 150]
```

---

### Items Array (3 cố định: inverter, panel, battery)

| Index | Element |
|-------|---------|
| 0 | `[inverter_sku, qty]` |
| 1 | `[panel_sku, qty]` |
| 2 | `[battery_sku, qty]` — `sku=0` nếu không có pin lưu trữ |

**Ví dụ:**
```json
[[1,1],[2,12],[3,1]]
```

---

### Full Payload Example
```json
[[1,1,1500000,50,30,180,1,1,1,11.533486,106.891618,0,0,0],[[1,1],[2,12],[3,1]]]
```

Encoded:
```
https://inv.nalu.vn/?data=WJNMT2sxNTAwMDAwNTAzMDE4MDEwMQ...
```

---

## 2. Proposal Share Link

**Format:**
```
https://inv.nalu.vn/quote/{share_slug}
```

### DB Lookup (inv.nalu.vn query trực tiếp)
```sql
SELECT qp.id, qp.title, qp.share_slug, qp.status, qp.expires_at,
       qp.notes, qp.plant_id
FROM quote_proposals qp
WHERE qp.share_slug = $1
```

### Related Quotes
```sql
SELECT id, proposal_id, option_label, option_order, is_recommended, is_selected,
       status, data, system_power, total_price, notes, created_at, updated_at
FROM quotes WHERE proposal_id = $1 ORDER BY option_order
```

`quotes.data` là JSONB chứa cấu hình chi tiết tính toán.

### Proposal Status Enum
```sql
proposal_status AS ENUM ('created', 'select', 'confirm', 'complete', 'cancelled')
```

---

## 3. Plant Share Link (mới)

**Format:**
```
https://inv.nalu.vn/plant/{share_slug}
```

### DB Schema (cần thêm 2 cột)
```sql
ALTER TABLE plants ADD COLUMN IF NOT EXISTS share_slug VARCHAR(100) UNIQUE;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_plants_share_slug ON plants(share_slug);
```

### DB Functions (Calnalu lib/db.ts)
- `generatePlantSlug()` → tạo slug ngẫu nhiên
- `createPlantShare(plantId, expiresDays)` → INSERT share_slug + expires_at
- `getPlantBySlug(slug)` → SELECT plant by share_slug
- `getQuotesByPlantId(plantId)` → SELECT quotes for plant's proposals
- `refreshPlantShare(slug)` → UPDATE expires_at +7 days

### Plant Flow
```
1. Khách hàng link: https://inv.nalu.vn/plant/{slug}
2. inv.nalu.vn: SELECT * FROM plants WHERE share_slug = $1
3. SELECT q.* FROM quotes q JOIN quote_proposals qp ON q.proposal_id = qp.id WHERE qp.plant_id = $1
4. Cache data, render tabs (mỗi proposal 1 tab)
5. Nút "Làm mới": POST /api/plants/{slug}/refresh
```

---

## 4. Calnalu API Endpoints (inv.nalu.vn chỉ gọi accept)

```
POST https://calnalu.vn/api/quotes/{quote_id}/accept
```

**Body:**
```json
{
  "data": { ... },
  "total_amount": number
}
```

Phản hồi: tạo `quote_confirmations`, cập nhật status.

---

## 5. Admin Pages (tham khảo)

| Route | Mô tả |
|-------|------|
| `/admin/proposals` | List proposals |
| `/admin/proposals/{id}` | Detail: status, send, delete |
| `/admin/plants` | List plants |
| `/admin/plants/{id}` | Detail: tạo share link, refresh |
| `/admin/projects` | List projects |
| `/admin/projects/{id}` | Detail project |
| `/admin/projects/{id}/edit` | Edit project |
| `/admin/customers` | List khách hàng |
| `/admin/customers/{id}` | Detail khách hàng |

---

## 6. Calculator Input Reference

### Input Fields
- `electricityType`: 'residential' | 'business'
- `inputType`: 'bill' | 'kwh' (residential only)
- `billAmount`: monthly electricity bill (VND)
- `kwhUsage`: monthly kWh usage
- `phase`: '1-phase' | '3-phase'
- `daytimeUsage`: 0–100 (%)
- `tilt`: panel tilt angle
- `azimuth`: panel azimuth angle
- `storage`: 'yes' | 'no' | 'pending'
- `latitude`, `longitude`: GPS coordinates
- `inverterFactory`: preferred brand

### Output (clone từ Calnalu)
- `system_power` (kWp)
- `inverter`, `panel`, `battery` (selected products)
- `panelCount`, `batteryCount`
- `totalCost` (VND)
- `componentItems`
- Economic analysis (ROI, payback period, savings)

### Libraries to Clone
```
lib/solar-tools.ts        — sizing, product selection
lib/electricity-pricing.ts  — giá điện VN
lib/electricity.ts        — bill-to-kWh conversion
lib/solar-calculator-logic.ts — calculation logic
lib/coef.json             — polynomial coefficients
```