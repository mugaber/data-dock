import { redirect } from "next/navigation";
import { authPath } from "@/lib/paths";

export default function Home() {
  redirect(authPath());
}
