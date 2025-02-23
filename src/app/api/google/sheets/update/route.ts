import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { accessToken, spreadsheetId, sheetName, data, startRow } =
      await req.json();

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets.properties",
    });

    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === sheetName
    );

    if (!sheet?.properties?.sheetId) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }

    // @ts-expect-error - data is an array of arrays
    const maxColumns = Math.max(...data.map((row) => row.length));
    const requiredRows = startRow + data.length;

    const currentRowCount = sheet.properties.gridProperties?.rowCount || 0;
    const currentColumnCount =
      sheet.properties.gridProperties?.columnCount || 0;

    if (requiredRows > currentRowCount || maxColumns > currentColumnCount) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              updateSheetProperties: {
                properties: {
                  sheetId: sheet.properties.sheetId,
                  gridProperties: {
                    rowCount: Math.max(currentRowCount, requiredRows),
                    columnCount: Math.max(currentColumnCount, maxColumns),
                  },
                },
                fields: "gridProperties",
              },
            },
          ],
        },
      });
    }

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
