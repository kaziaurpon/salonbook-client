import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function SignUpAlias({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (Array.isArray(value)) value.forEach((item) => search.append(key, item));
    else if (value !== undefined) search.set(key, value);
  }
  redirect(`/register${search.size ? `?${search.toString()}` : ""}`);
}
