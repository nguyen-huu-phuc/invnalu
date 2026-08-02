// Solar Calculator Tools - Hybrid model (poly tilt x Fourier azimuth), degree 3
interface SolarInput { tilt: number; azimuth: number; }

const solarModel = {
  intercept: 1433.0059186180,
  coef: [
    1.4768934064, -0.2063170350, 0.0010454640,
    -0.7125631210, 1.5859970363, -0.3096963503, -4.7375170537, -0.1687925158, 0.2744023803,
    1.7839105466, -4.1736795551, 0.0620948935, 1.1876338575, 0.0259431541, 0.0917713144,
    -0.0149973706, -0.0077167438, -0.0025785251, -0.0600873502, 0.0008098284, -0.0114161823,
    0.0000058547, 0.0004456383, 0.0000162032, 0.0003862738, -0.0000124539, 0.0001205143,
  ],
};

function predictAC(tiltOrInput: number | SolarInput, azimuth?: number): number {
  let t: number, a: number;
  if (typeof tiltOrInput === 'object' && tiltOrInput !== null) {
    t = tiltOrInput.tilt;
    a = tiltOrInput.azimuth;
  } else {
    t = tiltOrInput;
    a = azimuth as number;
  }
  const r = (a * Math.PI) / 180;
  const t2 = t * t, t3 = t2 * t;
  const f: number[] = [
    t, t2, t3,
    Math.sin(r), Math.cos(r),
    Math.sin(2 * r), Math.cos(2 * r),
    Math.sin(3 * r), Math.cos(3 * r),
    t * Math.sin(r), t * Math.cos(r),
    t * Math.sin(2 * r), t * Math.cos(2 * r),
    t * Math.sin(3 * r), t * Math.cos(3 * r),
    t2 * Math.sin(r), t2 * Math.cos(r),
    t2 * Math.sin(2 * r), t2 * Math.cos(2 * r),
    t2 * Math.sin(3 * r), t2 * Math.cos(3 * r),
    t3 * Math.sin(r), t3 * Math.cos(r),
    t3 * Math.sin(2 * r), t3 * Math.cos(2 * r),
    t3 * Math.sin(3 * r), t3 * Math.cos(3 * r),
  ];
  return solarModel.intercept + solarModel.coef.reduce((s, c, i) => s + c * f[i], 0);
}

// ============================================================================
// ELECTRICITY PRICING (unchanged - business logic, not solar physics)
// ============================================================================

export const ELECTRICITY_PRICE_TIERS = [
  { min: 0, max: 50, price: 2044 },
  { min: 51, max: 100, price: 2112 },
  { min: 101, max: 200, price: 2453 },
  { min: 201, max: 300, price: 3089 },
  { min: 301, max: 400, price: 3453 },
  { min: 401, max: Infinity, price: 3566 },
]

export const BUSINESS_ELECTRICITY_PRICES = {
  normal: 3404,
  peak: 5856,
  offpeak: 2071
}

export function calculateBusinessMonthlyCost(normal: number, peak: number, offpeak: number): number {
  return (normal * BUSINESS_ELECTRICITY_PRICES.normal) + 
         (peak * BUSINESS_ELECTRICITY_PRICES.peak) + 
         (offpeak * BUSINESS_ELECTRICITY_PRICES.offpeak);
}

export function calculateBusinessSavings(
  monthlyProduction: number, 
  normalKwh: number, 
  peakKwh: number, 
  batteryUsable: number, 
  storageOption: string
): { total: number; normal: number; peak: number } {
  // Solar sản xuất ban ngày → thay thế giờ bình thường
  const normalSavedKwh = Math.min(monthlyProduction, normalKwh);
  const normalSavedMoney = normalSavedKwh * BUSINESS_ELECTRICITY_PRICES.normal;

  let peakSavedKwh = 0;
  if (storageOption === 'yes' || storageOption === 'pending') {
    const batteryUsableMonthly = batteryUsable * 30;
    peakSavedKwh = Math.min(batteryUsableMonthly, peakKwh);
  }
  const peakSavedMoney = peakSavedKwh * BUSINESS_ELECTRICITY_PRICES.peak;

  return {
    total: normalSavedMoney + peakSavedMoney,
    normal: normalSavedMoney,
    peak: peakSavedMoney
  };
}

// ============================================================================
// CORE SOLAR PRODUCTION MODEL (from solar_model.ts)
// ============================================================================

/**
 * Get daily AC production (kWh/day) for given system size, tilt, and azimuth
 * Derived from yearly AC prediction: daily = yearly / 365
 */
export function calculateDailyProductionFromModel(
  systemPowerKwp: number,
  tilt: number,
  azimuth: number
): number {
  const yearlyACperKw = predictAC(tilt, azimuth)
  const dailyPerKw = yearlyACperKw / 365
  return systemPowerKwp * dailyPerKw
}

/**
 * Get efficiency factor relative to optimal orientation (tilt=12°, azimuth=180°)
 * Ranges from 0 to 1
 */
export function calculateEfficiencyFactor(tilt: number, azimuth: number): number {
  const optimalOutput = predictAC(12, 180)
  const actualOutput = predictAC(tilt, azimuth)
  const factor = actualOutput / optimalOutput
  return Math.max(0, Math.min(1, factor))
}

// ============================================================================
// BILL CONVERSION (unchanged)
// ============================================================================

export function electricityBillToKwh(billAmount: number): number {
  if (billAmount <= 0) return 0
  let remainingAmount = billAmount
  let totalKwh = 0
  for (const tier of ELECTRICITY_PRICE_TIERS) {
    const tierKwh = tier.max - tier.min + 1
    const tierCost = tierKwh * tier.price
    if (remainingAmount <= tierCost) {
      totalKwh += remainingAmount / tier.price
      break
    }
    totalKwh += tierKwh
    remainingAmount -= tierCost
  }
  return Math.round(totalKwh * 10) / 10
}

export function kwhToElectricityBill(kwh: number): number {
  if (kwh <= 0) return 0
  let remainingKwh = kwh
  let totalCost = 0
  for (const tier of ELECTRICITY_PRICE_TIERS) {
    const tierKwh = tier.max - tier.min + 1
    const kwhInTier = Math.min(remainingKwh, tierKwh)
    totalCost += kwhInTier * tier.price
    remainingKwh -= kwhInTier
    if (remainingKwh <= 0) break
  }
  return Math.round(totalCost)
}

// ============================================================================
// SYSTEM SIZING (uses polynomial model)
// ============================================================================

/**
 * Công suất PV cần (kWp) - NGUỒN DUY NHẤT cho việc sizing hệ thống.
 * Dùng chung cho autoselect số tấm ở UI (solar-calculator) và hook tính toán
 * (useSolarCalculation). Mọi thay đổi công thức chỉ cần sửa ở đây.
 *
 * - Tải ban ngày: bám tải ("no") ×1.2, có/ sẽ có lưu trữ ("yes"/"pending") ×1.0
 * - Sạc pin: min(dung lượng khả dụng, nhu cầu đêm) / 0.9 (bù hao sạc ~10%) × 1.2 (dự phòng)
 */
export function calculateSizingSystemKwp(params: {
  daytimeKwh: number
  nighttimeKwh: number
  batteryUsable: number // dung lượng khả dụng (kWh) = capacity × DOD; 0 nếu không lưu trữ
  storage: string
  tilt: number
  azimuth: number
}): number {
  const { daytimeKwh, nighttimeKwh, batteryUsable, storage, tilt, azimuth } = params
  const dailyPerKw = calculateDailyProductionFromModel(1, tilt, azimuth)
  if (dailyPerKw <= 0) return 0
  const daytimeEnergy = storage === "no" ? daytimeKwh * 1.2 : daytimeKwh
  const chargeEnergy = batteryUsable > 0 ? (Math.min(batteryUsable, nighttimeKwh) / 0.9) * 1.2 : 0
  return (daytimeEnergy + chargeEnergy) / dailyPerKw
}

/**
 * Calculate required system power (kWp) based on consumption and battery
 * (dùng cho pump-tools)
 */
export function calculateSystemPower(
  monthlyKwh: number,
  daytimeUsagePercent: number = 50,
  tilt: number = 12,
  azimuth: number = 180,
  batteryCapacityKwh: number = 0,
  storageOption: string = 'no'
): number {
  const dailyKwh = monthlyKwh / 30
  const daytimeKwh = dailyKwh * (daytimeUsagePercent / 100)

   // Battery energy needed from panels (account for inverter losses: 1/0.9)
   const batteryRequired = batteryCapacityKwh > 0 ? batteryCapacityKwh / 0.9 : 0

   // Energy panels must produce: daytime usage + battery charging
   // Coefficient varies based on storage option:
   // - 'yes' or 'pending' (hybrid): coefficient = 1.0
   // - 'no' (no storage): coefficient = 1.2
   const storageCoefficient = storageOption === 'no' ? 1.2 : 1.0
   const energyNeeded = daytimeKwh * storageCoefficient + batteryRequired

  // Daily production per kWp from polynomial model at given orientation
  const dailyProductionPerKw = calculateDailyProductionFromModel(1, tilt, azimuth)

  if (dailyProductionPerKw <= 0) return 0

  return Math.ceil((energyNeeded / dailyProductionPerKw) * 10) / 10
}

export function calculatePanelCount(systemPowerKwp: number, panelWattage: number): number {
  return Math.ceil((systemPowerKwp * 1000) / panelWattage)
}

export function calculatePowerFromPanels(panelCount: number, panelWattage: number): number {
  return (panelCount * panelWattage) / 1000
}

// ============================================================================
// BATTERY-AWARE SAVINGS (consumption matching logic)
// ============================================================================

/**
 * Calculate electricity saved (kWh/month) considering battery storage
 */
export function calculateElectricitySavedKwh(
  monthlyProduction: number,
  daytimeKwh: number,
  nighttimeKwh: number,
  batteryUsable: number,
  chargeCoverage: number,
  storageOption: string
): number {
  if (storageOption === 'yes') {
    const batteryUsableMonthly = batteryUsable * 30
    const chargeCoverageUsableMonthly = batteryUsableMonthly * (chargeCoverage / 100)
    return Math.min(monthlyProduction, daytimeKwh * 30) + Math.min(batteryUsableMonthly, chargeCoverageUsableMonthly, nighttimeKwh * 30)
  }
  return Math.min(monthlyProduction * 0.7, daytimeKwh * 30)
}

/**
 * Calculate money saved using tiered electricity pricing
 */
export function calculateMoneySavedTiered(
  inputType: 'bill' | 'kwh',
  billAmount: number,
  kwhUsage: number,
  electricitySavedKwh: number
): number {
  const totalInputBill = inputType === 'bill' ? billAmount : kwhToElectricityBill(kwhUsage)
  const totalKwh = inputType === 'bill' ? electricityBillToKwh(billAmount) : kwhUsage
  const remainingKwh = Math.max(0, totalKwh - electricitySavedKwh)
  return totalInputBill - kwhToElectricityBill(remainingKwh)
}

// ============================================================================
// INVERTER & BATTERY SELECTION
// ============================================================================

export interface InverterOptionAdvanced {
   id: string | number
   product_name: string
   max_output_power: number
   max_dc_vol_input: number
  dc_vol_input_rate?: number
   string: number
   phase: number
   inverter_type: string
   price?: number
   install_price?: number
   factory?: string
 }

export function selectInverterOptimized(
  systemWp: number,
  inverterList: InverterOptionAdvanced[],
  pVoc: number,
  pWattage: number,
  eff: number,
  panelCount: number,
  storage: string,
  phase: string,
  factory?: string
): { id: string; count: number } {
  if (inverterList.length === 0) return { id: "", count: 1 }
  const invType = storage === 'yes' || storage === 'pending' ? 'hybrid' : ''
  const phaseNum = phase === '1-phase' ? 1 : 3
  let filtered = inverterList.filter(inv => inv.phase === phaseNum && (invType === '' || inv.inverter_type === invType))
  if (factory && factory !== 'all') filtered = filtered.filter(inv => inv.factory === factory)
  if (filtered.length === 0) return { id: "", count: 1 }
  const results = filtered.map(inv => {
const maxPanelVoc = Math.floor((inv.max_dc_vol_input * 0.85) / pVoc) * inv.string
     const rateInvPanel = Math.min(Math.round((inv.max_output_power * 1.2) / (pWattage * eff)), maxPanelVoc)
    return { inv, rateInvPanel }
  })
const validWithRate = results.filter(r => r.rateInvPanel >= panelCount)
   if (validWithRate.length > 0) {
     validWithRate.sort((a, b) => {
       const priceA = a.inv.price ?? a.inv.install_price ?? Infinity
       const priceB = b.inv.price ?? b.inv.install_price ?? Infinity
       if (priceA !== priceB) return priceA - priceB
       return b.rateInvPanel - a.rateInvPanel
     })
     return { id: validWithRate[0].inv.id.toString(), count: 1 }
   }
   const validResults = results.filter(r => r.rateInvPanel > 0)
   if (validResults.length === 0) return { id: results[0].inv.id.toString(), count: 1 }
   validResults.sort((a, b) => {
     if (b.inv.max_output_power !== a.inv.max_output_power) return b.inv.max_output_power - a.inv.max_output_power
     const priceA = a.inv.price ?? a.inv.install_price ?? Infinity
     const priceB = b.inv.price ?? b.inv.install_price ?? Infinity
     return priceA - priceB
   })
   const maxInv = validResults[0]
   const count = Math.ceil(panelCount / maxInv.rateInvPanel)
   return { id: maxInv.inv.id.toString(), count }
}

export interface BatteryOption {
  id: string
  product_name: string
  capacity: number // kWh
  dod?: number // %, default 80
}

export interface BatterySelectionResult {
  battery: BatteryOption | null
  count: number
  totalCapacity: number
  usableCapacity: number
}

export function selectBattery(
  nighttimeKwh: number,
  batteries: BatteryOption[]
): BatterySelectionResult {
  if (batteries.length === 0) return { battery: null, count: 1, totalCapacity: 0, usableCapacity: 0 }
  const sortedByCapacity = [...batteries].sort((a, b) => a.capacity - b.capacity)
  const largestBattery = sortedByCapacity[sortedByCapacity.length - 1]
  const largestCapacity = largestBattery.capacity
  const requiredUsable = nighttimeKwh
  const threshold = largestCapacity * 1.2
  if (requiredUsable <= threshold) {
    const tier1 = sortedByCapacity.filter(b => {
      const usable = b.capacity * ((b.dod || 80) / 100)
      const ratio = usable / requiredUsable
      return ratio >= 0.8 && ratio <= 1.1
    })
    if (tier1.length > 0) {
      const selected = tier1[0]
      const dod = (selected.dod || 80) / 100
      return { battery: selected, count: 1, totalCapacity: selected.capacity, usableCapacity: selected.capacity * dod }
    }
    const tier2 = sortedByCapacity.filter(b => {
      const usable = b.capacity * ((b.dod || 80) / 100)
      const ratio = usable / requiredUsable
      return ratio >= 0.7 && ratio <= 1.2
    })
    if (tier2.length > 0) {
      const selected = tier2[0]
      const dod = (selected.dod || 80) / 100
      return { battery: selected, count: 1, totalCapacity: selected.capacity, usableCapacity: selected.capacity * dod }
    }
    const fallback = sortedByCapacity.find(b => b.capacity * ((b.dod || 80) / 100) >= requiredUsable * 0.7) || sortedByCapacity[0]
    const dod = (fallback.dod || 80) / 100
    return { battery: fallback, count: 1, totalCapacity: fallback.capacity, usableCapacity: fallback.capacity * dod }
  }
  const largestDod = (largestBattery.dod || 80) / 100
  const usablePerUnit = largestBattery.capacity * largestDod
  const count = Math.max(2, Math.round(requiredUsable / usablePerUnit))
  return {
    battery: largestBattery,
    count,
    totalCapacity: largestBattery.capacity * count,
    usableCapacity: usablePerUnit * count,
  }
}
