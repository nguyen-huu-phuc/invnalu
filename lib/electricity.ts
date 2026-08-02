// Bảng giá điện sinh hoạt mới (đã bao gồm VAT 8%)
// ĐƠN GIÁ (đồng/kWh) | SẢN LƯỢNG (kWh)
// Bậc 1: 2,143 | 52 kWh
// Bậc 2: 2,214 | 52 kWh (tổng 104 kWh)
// Bậc 3: 2,570 | 103 kWh (tổng 207 kWh)
// Bậc 4: 3,238 | 103 kWh (tổng 310 kWh)
// Bậc 5: 3,618 | 103 kWh (tổng 413 kWh)
// Bậc 6: 3,737 | còn lại
export const ELECTRICITY_PRICE_TIERS = [
  { limit: 52, price: 2143 },
  { limit: 104, price: 2214 },
  { limit: 207, price: 2570 },
  { limit: 310, price: 3238 },
  { limit: 413, price: 3618 },
  { limit: Infinity, price: 3737 },
]

export function calculateKwhFromBill(billAmount: number): number {
  let remainingAmount = billAmount
  let totalKwh = 0
  let prevLimit = 0

  for (const tier of ELECTRICITY_PRICE_TIERS) {
    const tierKwh = tier.limit - prevLimit
    if (tier.limit === Infinity) {
      totalKwh += remainingAmount / tier.price
    } else {
      const tierCost = tierKwh * tier.price
      if (remainingAmount <= tierCost) {
        totalKwh += remainingAmount / tier.price
        break
      } else {
        totalKwh += tierKwh
        remainingAmount -= tierCost
      }
    }
    prevLimit = tier.limit
  }

  return Math.round(totalKwh)
}

// Alias for backward compatibility with Header
export const electricityBillToKwh = calculateKwhFromBill