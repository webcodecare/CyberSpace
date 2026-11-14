import { NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";

type Ctx = { params: Promise<{ id: string }> };
const h = async (req: NextRequest, { params }: Ctx) =>
  proxy(req, `/jobs/${encodeURIComponent((await params).id)}`, { auth: "required" });

export const GET = h;
export const PATCH = h;
export const DELETE = h;
