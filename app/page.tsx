import Image from 'next/image'

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
      <Image
        src="/slogan.webp"
        alt="Nalu Solar"
        width={400}
        height={120}
        className="mx-auto"
      />
    </div>
  )
}
