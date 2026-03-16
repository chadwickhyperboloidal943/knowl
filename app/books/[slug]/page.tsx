import { redirect } from "next/navigation";

// Redirect old /books/[slug] links to the new /nodes/[slug] route
export default async function BookDetailsRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/nodes/${slug}`);
}
