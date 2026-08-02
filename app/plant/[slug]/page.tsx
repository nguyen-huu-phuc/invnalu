import { getPlantBySlug, getQuotesByPlantId, getProducts } from '@/lib/db'
import { ProductCatalog } from '@/lib/solar-calculator-logic'
import { PlantClientView } from '@/components/viewer/plant-client-view'
import { Toaster } from 'sonner'
import { notFound } from 'next/navigation'

export default async function PlantSharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const plant = await getPlantBySlug(slug)

  if (!plant) {
    notFound()
  }

  const isExpired = plant.expires_at ? new Date(plant.expires_at) < new Date() : false

  const quotesRaw = await getQuotesByPlantId(plant.id)
  const products = await getProducts()

  const catalog: ProductCatalog = {
    inverters: products.inverters,
    panels: products.panels,
    batteries: products.batteries,
    components: products.components,
  }

  const quotes = quotesRaw.map(q => ({
    ...q,
    data: typeof q.data === 'string' ? JSON.parse(q.data) : q.data,
  }))

  return (
    <>
      <Toaster />
      <div className="container mx-auto px-0 py-0 sm:px-4 sm:py-6 max-w-5xl">
        <PlantClientView
          plant={plant}
          quotes={quotes}
          catalog={catalog}
          isExpired={isExpired}
        />
      </div>
    </>
  )
}
