import type { Metadata } from "next"
import Image from "next/image"
import { CalculatorClientView } from "@/components/viewer/calculator-client-view"
import { ShareViewLayout } from "@/components/layouts/share-view-layout"
import { decodeShareData } from "@/lib/share-encoding"
import { getProducts } from "@/lib/db"
import { ProductCatalog, calculateSolarAnalysis } from "@/lib/solar-calculator-logic"

export const revalidate = 300

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>
}): Promise<Metadata> {
  const { data } = await searchParams

  if (!data) {
    return {
      title: "Nalu | Xem báo giá",
    }
  }

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

    const inverterType =
      calcResult.inverterType === "hybrid" ? "hybrid" : "ongrid"
    const systemPower = calcResult.quoteData.system_power.toFixed(1)
    let title = `Hệ thống ${inverterType} công suất ${systemPower} kWp`
    if (calcResult.hasStorage && calcResult.batteryCapacity > 0) {
      title += `, lưu trữ ${Number(calcResult.batteryCapacity).toFixed(1)} kWh`
    }

    return {
      title,
      description: title,
      openGraph: { title, description: title, images: ["/nalu-logo-trans-512x234.png"] },
      twitter: { card: "summary_large_image", title, description: title, images: ["/nalu-logo-trans-512x234.png"] },
    }
  } catch {
    return {
      title: "Nalu | Xem báo giá",
      openGraph: { title: "Nalu | Xem báo giá", images: ["/nalu-logo-trans-512x234.png"] },
      twitter: { card: "summary_large_image", title: "Nalu | Xem báo giá", images: ["/nalu-logo-trans-512x234.png"] },
    }
  }
}

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

      return (
        <ShareViewLayout>
          <CalculatorClientView calcResult={calcResult} encodedData={data} />
        </ShareViewLayout>
      )
    } catch {
      return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Image
        src="/slogan.webp"
        alt="Nalu Solar"
        width={400}
        height={200}
        priority
        className="mx-auto max-w-full w-auto h-auto"
        style={{ maxWidth: '400px' }}
      />
    </div>
  )
}

