import { google } from "googleapis";
import { NextResponse } from "next/server";
import { ForecastData } from "@/lib/types/index";

export async function POST(req: Request) {
  try {
    const { accessToken, connectionName, sheetInfo } = await req.json();

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `${connectionName} - Forecast Data ${new Date().toLocaleDateString()}`,
        },
        sheets: sheetInfo.map((item: ForecastData) => ({
          properties: {
            title: item.name,
          },
        })),
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;

    return NextResponse.json({
      success: true,
      spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    });
  } catch (error) {
    console.error("Google Sheets API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create Google Sheet",
      },
      { status: 500 }
    );
  }
}
