import { NextResponse } from "next/server";
import { sendInvitation } from "@/lib/invitations";

// TODO: (extra) Verify user is the owner of the organization

export async function POST(req: Request) {
  try {
    const { email, organizationName } = await req.json();
    await sendInvitation(email, organizationName);

    return NextResponse.json(
      { message: "Invitation sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to send invitation";
    console.error("Failed to send invitation:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
