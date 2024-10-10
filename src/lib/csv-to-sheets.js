// Required Packages
const { google } = require('googleapis');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

// Configuration Variables
const CSV_FILE_PATH = './test-connection-1/expense_items.csv'//process.env.CSV_FILE_PATH; // Path to the CSV file
const GOOGLE_CREDENTIALS_FILE = './client_secret_47154737383-ailpdlh6q7kbc8vt3ckgivn7dvg6mdo4.apps.googleusercontent.com.json';

// Load OAuth2 Client
if (!fs.existsSync(GOOGLE_CREDENTIALS_FILE)) {
  console.error('Google OAuth client JSON file not found.');
  process.exit(1);
}
const credentials = require(GOOGLE_CREDENTIALS_FILE);
const { client_id, client_secret, redirect_uris } = credentials.web;

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// Generate Auth URL
function getAuthUrl() {
  const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
  console.log('Authorize this app by visiting this URL:', authUrl);
}

// Read CSV Data
async function readCsvData() {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve(rows))
      .on('error', (err) => reject(err));
  });
}

// Write Data to Google Sheets
async function writeToGoogleSheets(auth, data) {
  if (!data.length) return console.log('No data to write to Google Sheets.');

  const sheets = google.sheets({ version: 'v4', auth });

  // Create a new spreadsheet
  const createResponse = await sheets.spreadsheets.create({
    resource: {
      properties: { title: 'Imported CSV Data' },
    },
  });
  const spreadsheetId = createResponse.data.spreadsheetId;
  console.log(`Spreadsheet created with ID: ${spreadsheetId}`);

  // Prepare the data
  const headers = Object.keys(data[0]);
  const values = [headers, ...data.map(Object.values)];

  // Write data to the first sheet
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Sheet1',
    valueInputOption: 'RAW',
    resource: { values },
  });

  console.log('Data successfully written to Google Sheets.');
}

// Main Function
(async function () {
  getAuthUrl();
  console.log('After authorizing, paste the code here to proceed.');

  // Prompt user for authorization code (manual input for demo purposes)
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', async (code) => {
    try {
      const { tokens } = await oauth2Client.getToken(code.trim());
      oauth2Client.setCredentials(tokens);
      const csvData = await readCsvData();
      await writeToGoogleSheets(oauth2Client, csvData);
    } catch (err) {
      console.error('Error during authorization or data migration:', err);
    } finally {
      process.exit();
    }
  });
})();
