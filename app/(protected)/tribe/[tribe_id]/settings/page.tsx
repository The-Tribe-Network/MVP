import { redirect } from "next/navigation";

export default async function Page({ params }: PageProps<'/tribe/[tribe_id]/settings'>) {
  const { tribe_id } = await params;
  
  return redirect(`/tribe/${tribe_id}/settings/general`);
}