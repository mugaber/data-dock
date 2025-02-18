import { google } from "googleapis";
import { NextResponse } from "next/server";
import { ForecastData } from "@/lib/types/index";

export async function POST(req: Request) {
  try {
    const { accessToken, connectionName, forecastData } = await req.json();

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `${connectionName} - Forecast Data ${new Date().toLocaleDateString()}`,
        },
        sheets: forecastData.map((item: ForecastData) => ({
          properties: {
            title: item.name,
          },
        })),
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;

    for (const item of forecastData) {
      if (Array.isArray(item.data) && item.data.length > 0) {
        const headers = Object.keys(item.data[0]);
        const values = [
          headers,
          ...item.data.map((row: Record<string, string>) =>
            headers.map((header) => row[header] ?? "")
          ),
        ];

        await sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheetId || "",
          range: `${item.name}!A1`,
          valueInputOption: "RAW",
          requestBody: { values },
        });
      }
    }

    const requests = forecastData.map((item: ForecastData) => ({
      repeatCell: {
        range: {
          sheetId: spreadsheet.data.sheets?.find(
            (sheet) => sheet.properties?.title === item.name
          )?.properties?.sheetId,
          startRowIndex: 0,
          endRowIndex: 1,
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
            textFormat: {
              bold: true,
              foregroundColor: { red: 1, green: 1, blue: 1 },
            },
          },
        },
        fields: "userEnteredFormat(backgroundColor,textFormat)",
      },
    }));

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId || "",
      requestBody: { requests },
    });

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
