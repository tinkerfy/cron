import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET() {
  try {
    // Combine into a single query — reduces DB round-trips from 2 to 1.
    // Note: only returns rows where BOTH compositeservicename AND server are non-null.
    const [[rows]] = await Promise.all([
      pool.query(`SELECT DISTINCT compositeservicename, server FROM cron_jobs WHERE status = 'true' AND compositeservicename IS NOT NULL AND server IS NOT NULL ORDER BY compositeservicename`),
    ]);

    const compositeservicename = (rows as { compositeservicename: string; server: string }[]).map((r) => r.compositeservicename);
    const servers = (rows as { compositeservicename: string; server: string }[]).map((r) => r.server);
    const statuses = ["true", "false"]; // Hardcoded — matches StatusFilter options

    return NextResponse.json({ compositeservicename, servers, statuses }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' }
    });
  } catch (error) {
    console.error("Failed to fetch filters:", error);
    return NextResponse.json({ error: "Failed to fetch filters" }, { status: 500 });
  }
}
