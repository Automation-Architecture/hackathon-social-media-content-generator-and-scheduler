# /generate — Generate Content for All Active Topics

## Description
Generates infographic scripts, captions, and images for all active topics using the content generation pipeline.

## Instructions
1. Read `directives/generate_content.md` for the full workflow
2. Read topics from `backend/data/topics.json`
3. Filter topics where `status = "active"`
4. For each active topic, follow the directive steps:
   - Run `execution/generate_script.py` with the topic's prompts
   - Run `execution/generate_image.py` with the returned script
   - Save results to `backend/data/content.json`
5. Report summary when done

## Usage
```
/generate
/generate --topic "Leadership"   (generate for a specific topic only)
```
