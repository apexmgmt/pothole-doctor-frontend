# Google Sheets Form Submission Setup Guide

This guide will help you set up your contact form to submit data directly to a Google Spreadsheet.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it something like "Contact Form Submissions"
4. In the first row, add these headers:
   ```
   A1: Timestamp | B1: First Name | C1: Last Name | D1: Phone | E1: Email | F1: Company | G1: Message | H1: Privacy
   ```

## Step 2: Create Google Apps Script

1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Replace the default code with this script:

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet and sheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();

    // Parse the incoming data
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (error) {
      // If JSON parsing fails, try form data
      data = e.parameter;
    }

    // Clean and validate phone number
    let phoneNumber = data.phone || "";
    if (phoneNumber) {
      // Remove any non-numeric characters except +, -, (, ), and space
      phoneNumber = phoneNumber.toString().replace(/[^\d\s\+\-\(\)]/g, "");
      // If it's empty after cleaning, set to empty string
      if (phoneNumber.trim() === "") {
        phoneNumber = "";
      }
    }

    // Prepare row data
    const rowData = [
      data.timestamp || new Date().toISOString(),
      data.firstName || "",
      data.lastName || "",
      phoneNumber, // Use cleaned phone number
      data.email || "",
      data.company || "",
      data.message || "",
      data.privacy || false,
    ];

    // Append the data to the sheet
    sheet.appendRow(rowData);

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({ result: "success", row: sheet.getLastRow() })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(
    "Contact Form Handler is working!"
  ).setMimeType(ContentService.MimeType.TEXT);
}
```

3. Click **Save** and give your project a name (e.g., "Contact Form Handler")
4. Click **Deploy** → **New deployment**
5. Choose **Web app** as the type
6. Set **Execute as** to "Me"
7. Set **Who has access** to "Anyone"
8. Click **Deploy**
9. **Copy the Web App URL** - you'll need this for the next step

## Step 3: Update Your Code

1. Open `services/contact.service.js`
2. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with the Web App URL you copied
3. The URL should look like: `https://script.google.com/macros/s/AKfycbz.../exec`

## Step 4: Test Your Form

1. Fill out and submit your contact form
2. Check your Google Sheet - you should see a new row with the submitted data
3. Each submission will create a new row with timestamp and all form fields

## Troubleshooting

### Form not submitting?

- Check the browser console for errors
- Verify the Google Apps Script URL is correct
- Make sure the Google Apps Script is deployed as a web app

### Data not appearing in sheet?

- Check the Apps Script execution log for errors
- Verify the sheet is active (not hidden)
- Check that the Apps Script has permission to access the sheet

### CORS errors?

- The `no-cors` mode in the service handles this
- If you still get errors, try using the FormData method instead

## Security Notes

- The Google Apps Script URL is public, so anyone can submit to your form
- Consider adding CAPTCHA or rate limiting for production use
- You can add validation in the Apps Script before saving data

## Alternative: Using Google Forms

If you prefer a simpler setup, you can also:

1. Create a Google Form
2. Set the form action to submit to your Google Sheet
3. Use an iframe to embed the form in your website

This approach requires less coding but gives you less control over the form styling and behavior.
