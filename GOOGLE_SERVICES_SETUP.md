# Google Services Setup Guide

SafeRoute Pulse integrates **Google Maps Directions API** and **Google Sheets API** for enhanced functionality.

## Prerequisites

- Google Cloud Project: `thematic-ruler-493404-h6` (your project)
- Active billing enabled on the Google Cloud project

## 1. Google Maps Directions API Setup

### Step 1: Enable the API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project: `thematic-ruler-493404-h6`
3. Navigate to **APIs & Services > Library**
4. Search for "Directions API"
5. Click **Enable**

### Step 2: Create an API Key
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Copy the API key
4. Restrict the key:
   - Click on the key, then:
   - Under **Key restrictions**, select **HTTP referrers (web sites)**
   - Add your domain(s): `localhost`, your deployment domain, etc.
   - Under **API restrictions**, select **Directions API**

### Step 3: Add API Key to App
1. Open `app.js`
2. Find this line:
   ```javascript
   apiKey: "YOUR_GOOGLE_MAPS_API_KEY",
   ```
3. Replace with your actual API key:
   ```javascript
   apiKey: "YOUR_COPIED_API_KEY_HERE",
   ```

## 2. Google Sheets Logging Setup (Optional)

### Step 1: Create a Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet called "SafeRoute Commute Log"
3. Add column headers in row 1:
   - A: Timestamp
   - B: Origin
   - C: Destination
   - D: Mode
   - E: Safety Score
   - F: Risk Level
   - G: Delay (min)
   - H: Total Time (min)
   - I: User Preference

### Step 2: Get Sheet ID
1. Copy the Sheet ID from the URL (long alphanumeric string after `/d/`)
2. In `app.js`, replace:
   ```javascript
   sheetId: "YOUR_GOOGLE_SHEET_ID",
   ```
   with your actual Sheet ID

### Step 3: Set Up Backend Proxy (Required for Sheets Logging)
To log to Google Sheets, you'll need a backend service that handles authentication:

**Option A: Google Apps Script (Recommended)**
1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Replace the code with:
   ```javascript
   function doPost(e) {
     const sheet = SpreadsheetApp.openById(e.parameter.sheetId);
     const data = JSON.parse(e.postData.contents);
     sheet.getActiveRange().appendRow(data.values[0]);
     return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```
4. Deploy as web app:
   - Click **Deploy > New deployment**
   - Type: **Web app**
   - Execute as: Your account
   - Who has access: **Anyone**
5. Copy the deployment URL
6. Update your backend proxy endpoint in `app.js`

**Option B: Firebase Cloud Function**
Deploy a Cloud Function to handle Sheets API calls (requires Firebase setup)

## 3. Testing

### Test Maps Directions API
1. Open the app in your browser
2. Enter two locations (try "San Francisco" and "Los Angeles")
3. Click "Analyze my commute"
4. Check browser console (F12) for any errors
5. Verify travel times update based on real Google Maps data

### Test Sheets Logging
1. Complete a commute analysis
2. Check your Google Sheet for new logged entries
3. Verify all columns are populated correctly

## API Quota & Costs

- **Directions API**: First 25,000 requests/day free, then $0.005-0.015/request
- **Sheets API**: Free tier includes up to 500 requests/100 seconds

## Troubleshooting

### "Directions API Error"
- Check API key is correct and enabled
- Verify HTTP referrer restrictions aren't blocking your domain
- Check Google Cloud billing is enabled

### "Sheets logging error"
- Verify backend endpoint is deployed and accessible
- Check Google Sheets permissions are correct
- Inspect network tab in browser DevTools

### Map not updating with real times
- Ensure both origin and destination are properly geocoded
- Try specific city names: "San Francisco, CA" instead of just "San Francisco"
- Check API key quota in Google Cloud Console

## Security Best Practices

- ⚠️ **Never commit your API keys to GitHub**
- Use environment variables in production
- Restrict API keys by HTTP referrer and API
- Rotate API keys regularly
- Monitor quota usage in Google Cloud Console

## Disabling Google Services

To use the app without Google APIs:
- Leave `apiKey` and `sheetId` as placeholder values
- The app will gracefully fall back to simulated data
- Location autocomplete will still work (Places API is embedded)

## Support

For API issues, check:
- [Google Maps Directions API Docs](https://developers.google.com/maps/documentation/directions/overview)
- [Google Cloud Console Errors](https://console.cloud.google.com/errors)
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
