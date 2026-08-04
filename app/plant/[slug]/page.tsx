import type { Metadata } from "next"
import { getPlantBySlug, getQuotesByPlantId, getProducts } from '@/lib/db'
import { PlantClientView } from '@/components/viewer/plant-client-view'
import { ShareViewLayout } from '@/components/layouts/share-view-layout'

import { notFound } from 'next/navigation'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const plant = await getPlantBySlug(slug)

  if (!plant) {
    return { title: "Phương án", openGraph: { title: "Phương án", images: ["/nalu-logo-trans-512x234.png"] }, twitter: { card: "summary_large_image", title: "Phương án", images: ["/nalu-logo-trans-512x234.png"] } }
  }

  const plantName = plant.name || ""
  const customerName = plant.customer_name || ""
  const title = `Phương án ${plantName} ${customerName}`
  const description = "Hãy chọn phương án tối ưu"

  return { title, description, openGraph: { title, description, images: ["/nalu-logo-trans-512x234.png"] }, twitter: { card: "summary_large_image", title, description, images: ["/nalu-logo-trans-512x234.png"] } }
}

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
      <ShareViewLayout>
        <PlantClientView
          plant={plant}
          quotes={quotes}
          catalog={catalog}
          isExpired={isExpired}
        />
      </ShareViewLayout>
    </>
  )
}
