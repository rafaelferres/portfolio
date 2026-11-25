import { notFound } from "next/navigation";
import ServicePage from "@/components/ServicePage";
import { resolveService, serviceMetadata, serviceParams } from "@/lib/service-route";

const L = "es" as const;
export const dynamicParams = false;

export function generateStaticParams() {
  return serviceParams(L);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  return serviceMetadata(L, locale, slug);
}

export default async function Page({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const r = resolveService(L, locale, slug);
  if (!r) notFound();
  return <ServicePage id={r.id} locale={r.locale} />;
}
