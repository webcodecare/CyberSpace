import { NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";

// GET is admin-only (backend enforces); POST is the public application form.
export const GET = (req: NextRequest) => proxy(req, "/job-applications", { auth: "required" });
export const POST = (req: NextRequest) => proxy(req, "/job-applications", { auth: "none" });
