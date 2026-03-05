# Generate Content — Directive

## Goal
Generate unique infographic scripts + captions + images for all active topics.

## Steps

### Step 1 — Load Active Topics
Read `backend/data/topics.json` and filter where `status = "active"`.

### Step 2 — For Each Topic, Generate Script + Caption
Run the execution script:
```bash
python execution/generate_script.py \
  --title "<topic.topicName>" \
  --system-prompt "<topic.systemPrompt>" \
  --master-prompt "<topic.masterPrompt>"
```

Expected output (JSON on stdout):
```json
{
  "script": "A professional 1:1 square infographic titled...",
  "caption": "Leadership is not about authority..."
}
```

### Step 3 — Generate Image
Take the `script` from Step 2 and run:
```bash
python execution/generate_image.py --script "<script>"
```

Expected output (JSON on stdout):
```json
{
  "imageUrl": "https://..."
}
```

### Step 4 — Save Content
Append to `backend/data/content.json`:
```json
{
  "id": "<uuid>",
  "topicId": "<topic.id>",
  "script": "<script>",
  "caption": "<caption>",
  "imageUrl": "<imageUrl>",
  "status": "pending",
  "createdAt": "<ISO timestamp>"
}
```

### Step 5 — Report
Print summary: how many topics processed, successes, failures.

## Error Handling
- If Step 2 fails: log error, skip to next topic, continue
- If Step 3 fails: log error, save content with `status = "failed"` and `errorMessage`
- Never stop the entire batch for a single topic failure
