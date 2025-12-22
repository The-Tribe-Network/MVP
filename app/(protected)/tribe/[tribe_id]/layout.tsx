import { redirect } from "next/navigation";
import { checkTribeMembership } from "@/lib/services/permissions";
import { getServerUser } from "@/lib/services/auth";

export default async function TribeLayout({ children, params }: LayoutProps<'/tribe/[tribe_id]'>) {
  const { tribe_id } = await params;

  const user = await getServerUser();
  if (!user) {
    redirect(`/sign-in`);
  }

  const isMember = await checkTribeMembership(tribe_id, user.id);
  if (!isMember) {
    redirect(`/dashboard?toast_code=UNAUTHORIZED_TRIBE_ACCESS`);
  }

  return <>{children}</>;
}