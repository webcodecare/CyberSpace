import { NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";

const h = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  proxy(req, `/job-applications/${encodeURIComponent((await params).id)}/status`, { auth: "required" });

export const PATCH = h;
