# n8n Analytics & Ingest Updates

## Metrics Logging (Google Sheets)
1) In each primary workflow (`AnswerQuery`, `Estimate`, `Feedback`):
   - Add a **Code** node before logging to sanitize PII:
     ```js
     // Masks email + phone from `items`
     const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
     const phoneRegex = /\+?\d[\d\s().-]{7,}\d/gi;
     return items.map(item => {
       const mask = (val) =>
         typeof val === 'string'
           ? val.replace(emailRegex, '[REDACTED_EMAIL]').replace(phoneRegex, '[REDACTED_PHONE]')
           : val;
       const intent = mask(item.json.intent || item.json.text || 'unknown');
       return {
         json: {
           timestamp: new Date().toISOString(),
           conversation_id: item.json.conversationId || item.json.conversation_id || 'unknown',
           intent,
           was_escalated: Boolean(item.json.was_escalated || item.json.escalated),
           feedback_sentiment: item.json.feedback_sentiment || item.json.sentiment || '',
         },
       };
     });
     ```
   - Add a **Google Sheets** → *Append* node pointing to your metrics sheet with columns: `timestamp, conversation_id, intent, was_escalated, feedback_sentiment`.
   - Optional: add a size guard (Function node) to drop payloads where `intent.length > 2000`.

2) For feedback flow, map `feedback_sentiment` directly from the thumbs up/down.

## PII Masking Notes
- Run masking on every log node; ensure no raw user text is appended without regex replacement.
- If you log full payloads elsewhere, duplicate the same Code node to sanitize.

## Diff-Crawl for NightlyIngest
Add steps to `NightlyIngest` before scraping each URL:
1) **HTTP Request** (HEAD) to the page URL.
   - Store `Last-Modified` (if present) and `ETag`.
2) **IF** node:
   - Compare stored `Last-Modified`/`ETag` from previous run (persist in Redis or a Google Sheet state table).
   - If unchanged, skip scrape for that URL.
3) **HTTP Request** (GET) only for changed/unknown pages, then proceed to your existing embedding/ingest steps.
4) **Update State** node:
   - Write the new `Last-Modified`/`ETag` back to Redis/Sheet for next run.

## Sheet Schema & Sample
- Sheet columns: `timestamp | conversation_id | intent | was_escalated | feedback_sentiment`
- Publish the Sheet to the web for read-only dashboards; keep write access limited to the service account.

## Env/Creds Checklist
- n8n Google Sheets credentials configured for the service account.
- Store the sheet ID in an environment variable (e.g., `SHEETS_METRICS_ID`) and use it in all Append nodes.
- Ensure webhook inputs are validated before logging; reject oversized bodies.






