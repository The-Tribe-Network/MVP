import { redirect } from "next/navigation";

export default function PublicRootPage() {
  redirect("/home");
}
