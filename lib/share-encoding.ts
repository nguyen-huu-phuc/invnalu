import { SurveySettings, ItemInfo } from '@/lib/solar-calculator-logic'

export const FACTORY_MAP: Record<string, number> = {
  Deye: 1,
  Sungrow: 2,
  SMA: 3,
  Solaredge: 4,
  Fronius: 5,
  Lumentree: 6,
  Goodwe: 7,
  Growatt: 8,
  Huawei: 9,
}

export const REVERSE_FACTORY_MAP: Record<number, string> = Object.fromEntries(
  Object.entries(FACTORY_MAP).map(([k, v]) => [v, k])
) as Record<number, string>

export interface CompactItem {
  sku: number
  quantity: number
}

export interface CompactSurvey {
  electricityType: 1 | 2
  inputType: 1 | 2
  amount: number
  daytimeUsage: number
  tilt: number
  azimuth: number
  storage: 0 | 1 | 2
  phase: 0 | 1 | 2
  inverterFactory: number
  latitude: number
  longitude: number
  businessNormalKwh: number
  businessPeakKwh: number
  businessOffpeakKwh: number
}

export type SurveyArray = [
  number, number, number, number, number, number,
  number, number, number, number, number,
  number, number, number
]

export type ItemsArray = [[number, number], [number, number], [number, number]]

export function encodeShareData(
  survey: Record<string, any>,
  items: Array<{ product_type: string; sku: string | number; quantity: number }>
): string {
  const isResidential = survey.electricityType === 'residential'
  const isBill = isResidential && (survey.inputType === 'bill' || survey.billAmount !== undefined)
  const isKwh = isResidential && (survey.inputType === 'kwh' || (survey.kwhUsage !== undefined && survey.billAmount === undefined))

  const surveyArr: SurveyArray = [
    isResidential ? 1 : 2,
    isResidential ? (isBill ? 1 : 2) : 0,
    isBill ? survey.billAmount : isKwh ? survey.kwhUsage : 0,
    isResidential ? survey.daytimeUsage : 0,
    survey.tilt,
    survey.azimuth,
    survey.storage === 'yes' ? 1 : survey.storage === 'pending' ? 2 : 0,
    survey.phase === '3-phase' ? 2 : 1,
    FACTORY_MAP[survey.inverterFactory] || 0,
    survey.latitude,
    survey.longitude,
    isResidential ? 0 : survey.businessNormalKwh || 0,
    isResidential ? 0 : survey.businessPeakKwh || 0,
    isResidential ? 0 : survey.businessOffpeakKwh || 0,
  ]

  const invItem = items.find(i => i.product_type === 'inverter')
  const panelItem = items.find(i => i.product_type === 'panel')
  const battItem = items.find(i => i.product_type === 'battery')

  const itemsArr: ItemsArray = [
    [Number(invItem?.sku) || 0, Number(invItem?.quantity) || 1],
    [Number(panelItem?.sku) || 0, Number(panelItem?.quantity) || 0],
    [Number(battItem?.sku) || 0, Number(battItem?.quantity) || 0],
  ]

  const payload = [surveyArr, itemsArr] as [SurveyArray, ItemsArray]
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
}

export function decodeShareData(raw: string): { survey: SurveySettings; items: ItemInfo[] } {
  const decoded = JSON.parse(decodeURIComponent(escape(atob(raw))))

  if (Array.isArray(decoded)) {
    const [surveyArr, itemsArr] = decoded as [SurveyArray, ItemsArray]
    const isResidential = surveyArr[0] === 1

    const survey: SurveySettings = {
      inputType: isResidential ? (surveyArr[1] === 2 ? 'kwh' : 'bill') : 'bill',
      billAmount: isResidential && surveyArr[1] !== 2 ? surveyArr[2] : 0,
      kwhUsage: isResidential && surveyArr[1] === 2 ? surveyArr[2] : 0,
      electricityType: isResidential ? 'residential' : 'business',
      businessNormalKwh: isResidential ? 0 : surveyArr[11],
      businessPeakKwh: isResidential ? 0 : surveyArr[12],
      businessOffpeakKwh: isResidential ? 0 : surveyArr[13],
      daytimeUsage: isResidential ? surveyArr[3] : 0,
      tilt: surveyArr[4],
      azimuth: surveyArr[5],
      storage: surveyArr[6] === 1 ? 'yes' : surveyArr[6] === 2 ? 'pending' : 'no',
      phase: surveyArr[7] === 2 ? '3-phase' : '1-phase',
      inverterFactory: REVERSE_FACTORY_MAP[surveyArr[8]] || 'all',
      latitude: surveyArr[9],
      longitude: surveyArr[10],
    }

    const items: ItemInfo[] = [
      { product_type: 'inverter', sku: itemsArr[0][0], quantity: itemsArr[0][1] },
      { product_type: 'panel', sku: itemsArr[1][0], quantity: itemsArr[1][1] },
    ]
    if (itemsArr[2][0] > 0) {
      items.push({ product_type: 'battery', sku: itemsArr[2][0], quantity: itemsArr[2][1] })
    }

    return { survey, items }
  }

  return decoded as { survey: SurveySettings; items: ItemInfo[] }
}
