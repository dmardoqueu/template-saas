import Link from "next/link";
import { Metadata } from "next";

const metadata: Metadata = {
  title: "Template SaaS",
  description: "Template SaaS Rocketseat"
}

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Landing Page</h1>
      <Link href='/login'>
      <button>
        Login
      </button>
      </Link>
    </div>
  )
}
