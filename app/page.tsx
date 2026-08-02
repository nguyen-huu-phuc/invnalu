import { CalculatorClientView } from '@/components/viewer/calculator-client-view'
import { decodeShareData } from '@/lib/share-encoding'
import { getProducts } from '@/lib/db'
import { ProductCatalog, calculateSolarAnalysis } from '@/lib/solar-calculator-logic'

export default async function Home({ searchParams }: { searchParams: Promise<{ data?: string }> }) {
  const { data } = await searchParams

  if (data) {
    try {
      const { survey, items } = decodeShareData(data)
      const products = await getProducts()

      const catalog: ProductCatalog = {
        inverters: products.inverters,
        panels: products.panels,
        batteries: products.batteries,
        components: products.components,
      }

      const calcResult = calculateSolarAnalysis({ survey, items, catalog })

      return <CalculatorClientView calcResult={calcResult} encodedData={data} />
    } catch {
      return null
    }
  }

  return null
}
