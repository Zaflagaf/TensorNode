import { Play } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen m-auto">
      <Link href="/workflow" className="text-white ">
        <button className="flex items-center justify-center gap-2 p-5 transition cursor-pointer bg-emerald-500 rounded-2xl hover:scale-110 hover:scale-y-90">
          <Play /> WorkflowPage
        </button>
      </Link>
    </div>
  );
}
