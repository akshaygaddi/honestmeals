import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * This API route checks if the database has the correct tables and columns
 * It will create missing tables and columns if needed
 * Only accessible by administrators
 */
export async function POST(request: Request) {
  try {
    // Check if the request is authenticated as an admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if the user is an admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    // Execute the table check script
    const { data, error } = await supabase.rpc("run_table_check_script");

    if (error) {
      console.error("Error checking database tables:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Database tables checked and created if needed",
      details: data,
    });
  } catch (error) {
    console.error("Error in check-tables API route:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 