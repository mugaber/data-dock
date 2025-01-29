import { redirect } from "next/navigation";
import { integrationsPath } from "@/lib/paths";

export default function Dashboard() {
  redirect(integrationsPath());
}
