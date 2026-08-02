import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { FileText, Factory } from 'lucide-react'
import { getProducts } from '@/lib/db'
import { ProductCatalog, calculateSolarAnalysis } from '@/lib/solar-calculator-logic'
import { decodeShareData } from '@/lib/share-encoding'
import { CalculatorClientView } from '@/components/viewer/calculator-client-view'

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
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Link không hợp lệ</h2>
            <p className="text-muted-foreground">Không thể giải mã dữ liệu từ link này.</p>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <Image
            src="/slogan.webp"
            alt="Nalu Solar"
            width={400}
            height={120}
            className="mx-auto"
          />
        </div>
        <h1 className="text-2xl font-bold mb-4">inv.nalu.vn</h1>
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/quote/example">
              <FileText className="w-4 h-4 mr-2" />
              Xem báo giá mẫu
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/plant/example">
              <Factory className="w-4 h-4 mr-2" />
              Xem dự án mẫu
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
