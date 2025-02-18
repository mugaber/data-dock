import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { accessToken, spreadsheetId, sheetName, data, startRow } =
      await req.json();

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // @ts-expect-error - data is an array of arrays
    const maxColumns = Math.max(...data.map((row) => row.length));

    const getColumnLetter = (column: number) => {
      let letter = "";
      while (column > 0) {
        const remainder = (column - 1) % 26;
        letter = String.fromCharCode(65 + remainder) + letter;
        column = Math.floor((column - 1) / 26);
      }
      return letter;
    };

    const endCol = getColumnLetter(maxColumns);
    const endRow = startRow + data.length - 1;
    const range = `${sheetName}!A${startRow}:${endCol}${endRow}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values: data },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Google Sheets Update Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update sheet",
      },
      { status: 500 }
    );
  }
}
