# Plan: inv.nalu.vn

## Mục tiêu

- inv.nalu.vn là dự án **viewer** khách hàng xem economic-analysis.
- Dùng **chung PostgreSQL** với calnalu, nhưng **hoàn toàn độc lập** khi chạy: chỉ đọc DB trực tiếp, không gọi API calnalu.
- Calnalu có thể crash, inv.nalu.vn vẫn chạy bình thường.
- 2 loại link share: **quote** (không xác định KH) và **plant** (xác định KH, có làm mới).

---

## Database

### Thay đổi DUY NHẤT

Thêm 2 cột vào bảng `plants`:

```sql
ALTER TABLE plants ADD COLUMN IF NOT EXISTS share_slug VARCHAR(100) UNIQUE;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_plants_share_slug ON plants(share_slug);
```

Không thêm bảng mới, không sync, không DB riêng.

---

## Calnalu cần sửa

### 1. Admin UI: Plants

- `app/admin/plants/page.tsx` — danh sách plants
- `app/admin/plants/[id]/page.tsx` — chi tiết plant, nút **Tạo link khách hàng**, hiển thị share link, nút **Làm mới**
- `app/admin/layout.tsx` — thêm menu Plants vào sidebar
- `components/admin/admin-plants.tsx` — component list

### 2. API (2 endpoints, auth required)

| API | Mục đích |
|-----|----------|
| `POST /api/plants/share` | Tạo `share_slug` + `expires_at` cho plant |
| `POST /api/plants/[slug]/refresh` | Gia hạn `expires_at` thêm 7 ngày |

### 3. lib/db.ts

Thêm helper:
- `generatePlantSlug()`
- `createPlantShare(plantId, expiresDays)`
- `getPlantBySlug(slug)`
- `getQuotesByPlantId(plantId)`
- `refreshPlantShare(slug)`

---

## inv.nalu.vn tự làm

### 1. Clone logic tính toán từ calnalu

- `lib/solar-tools.ts` — sizing, inverter/panel/battery selection
- `lib/electricity-pricing.ts` — giá điện VN
- `lib/electricity.ts` — bill-to-kWh
- `lib/coef.json` — polynomial coefficients
- `lib/solar-calculator-logic.ts` — logic tính toán (không cần UI)

### 2. Clone UI economic-analysis

- `components/viewer/economic-analysis-viewer.tsx` — clone từ `components/economic-analysis.tsx`

### 3. Page routes (tự query DB trực tiếp)

- `app/quote/[slug]/page.tsx` — single quote share
- `app/plant/[slug]/page.tsx` — plant share (nhiều quotes → tabs)

### 4. Viewer components

- `components/viewer/auto-hide-topbar.tsx` — topbar tự ẩn sau 3s
- `components/viewer/tab-indicator.tsx` — tab 1|2|3 khi chuyển

### 5. DB connection

- `lib/db.ts` — kết nối **cùng** PostgreSQL `solar_calculator`, chỉ dùng SELECT.

---

## Luồng hoạt động

### Quote share link (không xác định KH)

```
calnalu: lưu báo giá → tạo quote_proposals + quotes → có share_slug
         ↓
Link: https://inv.nalu.vn/quote/{share_slug}
         ↓
inv.nalu.vn: SELECT * FROM quote_proposals WHERE share_slug = $1
             → load quotes[0].data.survey + items (1 lần)
             → cache vào memory
             → tính toán local (< 10ms)
             → render economic-analysis-viewer
```

### Plant share link (xác định KH)

```
calnalu: tạo plant → có customer_id
         ↓
inv.nalu.vn: tạo share link → INSERT INTO plants (share_slug, expires_at)
         ↓
Link: https://inv.nalu.vn/plant/{slug}
         ↓
inv.nalu.vn: SELECT * FROM plants WHERE share_slug = $1
             → SELECT * FROM quotes WHERE proposal_id IN (...)
             → cache tất cả data vào Map
             → tính toán tab đầu tiên
             → render tabs + economic-analysis
             → chuyển tab: lấy data từ Map, tính toán < 10ms
             → nút Làm mới: UPDATE plants SET expires_at = NOW() + 7 days
```

### Tính toán & hiệu năng

- **Không pre-calculate**. Tính toán rất nhẹ (< 10ms).
- Chỉ cần **pre-load data** 1 lần khi page load (1 query).
- Cache data vào memory, chuyển tab = đổi state + tính toán local.
- Không cần web worker, không cần background job.

---

## Khách chốt quote như thế nào?

inv.nalu.vn có 2 chế độ:

### Chế độ 1: Xem thôi (viewer)

- Khách xem economic analysis, so sánh options
- Không có nút chốt
- Phù hợp khi calnalu đang unstable hoặc khách chỉ cần xem trước

### Chế độ 2: Chốt quote (accept)

Khi khách muốn chốt, inv.nalu.vn có 2 option:

**Option A: Gọi API calnalu (khuyến nghị)**

```
inv.nalu.vn: POST https://calnalu/api/quotes/{id}/accept
             → calnalu tạo quote_confirmations
             → calnalu cập nhật status
             → inv.nalu.vn hiển thị "Đã chốt thành công"
```

- Ưu điểm: Tự động, không cần can thiệp thủ công
- Nhược điểm: Cần calnalu đang chạy
- Fallback: Nếu calnalu lỗi → hiển thị "Liên hệ sales để chốt"

**Option B: Liên hệ trực tiếp**

- inv.nalu.vn hiển thị thông tin liên hệ của sales/company
- Khách gọi/zalo để chốt
- Sales trong calnalu cập nhật status sau

### Recommendation

- inv.nalu.vn **mặc định** hiển thị nút **"Chốt báo giá"**
- Click → gọi API calnalu
- Nếu calnalu lỗi → fallback sang form liên hệ (Zalo/SDT)
- Không cần auth, không cần login trên inv.nalu.vn

---

## Triển khai

### Phase 1: Calnalu
1. `schema.sql` — thêm `share_slug`, `expires_at` vào `plants`
2. `lib/db.ts` — thêm helper functions
3. `app/api/plants/share/route.ts` — tạo share link
4. `app/api/plants/[slug]/refresh/route.ts` — gia hạn
5. Admin UI: plants list + detail + share link

### Phase 2: inv.nalu.vn
6. Init Next.js project
7. Clone solar calculation logic
8. Clone economic-analysis component
9. `app/quote/[slug]/page.tsx`
10. `app/plant/[slug]/page.tsx`
11. Auto-hide topbar + tab indicator

### Phase 3: Deploy
12. Deploy calnalu → Vercel
13. Deploy inv.nalu.vn → Vercel

---

## Lưu ý

- Cùng 1 PostgreSQL instance, cùng database `solar_calculator`.
- inv.nalu.vn chỉ có quyền SELECT trên các bảng chính.
- Calnalu chỉ cần thêm 2 cột vào `plants` + admin UI nhỏ.
- Không có sync, không có DB riêng, không có API public trung gian.
