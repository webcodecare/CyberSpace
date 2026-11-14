import { NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";

export const GET = (req: NextRequest) => proxy(req, "/jobs", { auth: "required" });
export const POST = (req: NextRequest) => proxy(req, "/jobs", { auth: "required" });
