import { NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";

export const GET = (req: NextRequest) => proxy(req, "/jobs/stats", { auth: "required" });
