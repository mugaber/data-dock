import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-navy">
      <h1 className="text-4xl font-bold text-white">Oops!</h1>
      <p className="text-lg text-gray-500">Something went wrong</p>
      <Link href="/auth">
        <Button>Go to Sign In</Button>
      </Link>
    </div>
  );
}
