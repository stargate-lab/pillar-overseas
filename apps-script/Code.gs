/**
 * Pillar Overseas — reserve-form lead capture.
 *
 * Setup:
 * 1. Create a Google Sheet with a header row:
 *    Timestamp | Name | Phone | District | Track
 * 2. In the Sheet: Extensions -> Apps Script, paste this file's contents in as Code.gs.
 * 3. Deploy -> New deployment -> Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the resulting /exec URL into js/config.js as leadSheetUrl.
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var params = (e && e.parameter) || {};

  sheet.appendRow([
    new Date(),
    params.name || '',
    params.phone || '',
    params.district || '',
    params.track || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Lets you sanity-check the deployment URL directly in a browser.
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Pillar Overseas lead endpoint is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
