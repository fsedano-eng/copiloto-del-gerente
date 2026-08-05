import { redirect } from "next/navigation";
import { getGerente } from "@/lib/supabase/server";

export default async function Home() {
  const gerente = await getGerente();
  redirect(gerente ? "/chat" : "/entrar");
}
