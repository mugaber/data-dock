import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const generateResponse = (content: {
    success: boolean;
    data?: { accessToken: string; refreshToken: string; expiryDate: number };
    error?: string;
  }) => {
    const html = `
      <html>
        <body>
          <script>
            const message = ${JSON.stringify(content)};
            if (window.opener) {
              window.opener.postMessage(message, "${baseUrl}");
              window.close();
            }
          </script>
        </body>
      </html>
    `;
    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  };

  if (error) {
    console.error("Google auth error:", error);
    return generateResponse({ success: false, error });
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/error?message=No authorization code received", req.url)
    );
  }

  try {
    const response = await fetch(`${baseUrl}/api/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error("Failed to exchange code for tokens");
    }

    return generateResponse({
      success: true,
      data: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiryDate: data.expiryDate,
      },
    });
  } catch (error) {
    console.error("Callback error:", error);
    return generateResponse({
      success: false,
      error: "Authentication failed",
    });
  }
}
