import { redirect } from "next/navigation";
import { connectionsPath } from "@/lib/paths";

export default function Dashboard() {
  redirect(connectionsPath());
}
