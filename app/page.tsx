import { Button } from "@/frontend/components/ui/shadcn/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="w-screen h-screen flex items-center justify-center">
      <Link href="/workflow">
        <Button className="cursor-pointer">Workflow</Button>
      </Link>
    </main>
  );
}
