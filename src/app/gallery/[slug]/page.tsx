import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkDetail } from "@/features/work/WorkDetail";
import { getCategories, getWork, getWorks } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

type Params = { slug: string };

/** Kuroco の全作品分をビルド時に HTML にする */
export function generateStaticParams(): Params[] {
  return getWorks().map((w) => ({ slug: w.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return {};
  const title = `${work.photo.alt}`;
  return {
    title,
    description: `写真家 hono の作品「${work.photo.alt}」`,
    alternates: { canonical: absoluteUrl(`/gallery/${slug}/`) },
    openGraph: {
      title: `${title} | hono`,
      url: absoluteUrl(`/gallery/${slug}/`),
      images: [
        { url: absoluteUrl(work.photo.src), width: work.photo.width, height: work.photo.height, alt: work.photo.alt },
      ],
    },
  };
}

export default async function WorkPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const works = getWorks();
  const work = works.find((w) => w.slug === slug);
  if (!work) notFound();
  return <WorkDetail work={work} works={works} categories={getCategories()} />;
}
