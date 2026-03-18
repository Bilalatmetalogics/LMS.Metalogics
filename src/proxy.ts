import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple passthrough — auth redirects handled in app layout and login page
export default function proxy(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
