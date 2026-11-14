import { NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";

export const PATCH = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  proxy(req, `/jobs/${encodeURIComponent((await params).id)}/status`, { auth: "required" });
