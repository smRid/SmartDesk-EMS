import { redirect } from "next/navigation";
import { getCurrentSession, getDashboardRedirect } from "@/lib/auth";

export default async function Home() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  redirect(getDashboardRedirect(session.role));
}
