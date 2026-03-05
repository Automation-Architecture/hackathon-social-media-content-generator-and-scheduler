#!/usr/bin/env python3
"""
Uploads image to Postiz, then creates/schedules a post.
Output: JSON { "postId": "...", "status": "scheduled" } on stdout.
Logs go to stderr.
"""

import argparse
import json
import os
import sys
import urllib.request
from datetime import datetime, timedelta


def load_env():
    api_key = os.environ.get("POSTIZ_API_KEY")
    base_url = os.environ.get("POSTIZ_BASE_URL", "https://api.postiz.com")

    if not api_key:
        env_path = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
        if os.path.exists(env_path):
            with open(env_path) as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("POSTIZ_API_KEY="):
                        api_key = line.split("=", 1)[1]
                    elif line.startswith("POSTIZ_BASE_URL="):
                        base_url = line.split("=", 1)[1]

    return api_key, base_url


def upload_image_file(filepath, api_key, base_url):
    """Upload image file directly to Postiz."""
    print(f"Uploading image file to Postiz...", file=sys.stderr)

    import mimetypes
    content_type = mimetypes.guess_type(filepath)[0] or "image/jpeg"
    boundary = "----ScriptoraBoundary"
    filename = os.path.basename(filepath)

    with open(filepath, "rb") as f:
        file_data = f.read()

    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: {content_type}\r\n\r\n"
    ).encode("utf-8") + file_data + f"\r\n--{boundary}--\r\n".encode("utf-8")

    req = urllib.request.Request(
        f"{base_url}/public/v1/upload",
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            "Authorization": api_key
        }
    )

    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    return result.get("id", ""), result.get("path", "")


def main():
    parser = argparse.ArgumentParser(description="Publish post via Postiz")
    parser.add_argument("--image-file", help="Local path to image file")
    parser.add_argument("--caption", help="Post caption text")
    parser.add_argument("--channel-ids", help="JSON array of channel IDs")
    parser.add_argument("--posting-time", help="Time to schedule (HH:MM)")
    parser.add_argument("--input-file", help="JSON file with all fields")
    args = parser.parse_args()

    if args.input_file:
        with open(args.input_file) as f:
            data = json.load(f)
        image_file = data["imageFile"]
        caption = data["caption"]
        channel_ids = json.loads(data["channelIds"])
        posting_time = data["postingTime"]
    else:
        image_file = args.image_file
        caption = args.caption
        channel_ids = json.loads(args.channel_ids)
        posting_time = args.posting_time

    api_key, base_url = load_env()

    if not api_key:
        print(json.dumps({"error": "POSTIZ_API_KEY not set"}))
        sys.exit(1)

    print(f"Publishing to {len(channel_ids)} channel(s)...", file=sys.stderr)

    try:
        # Step 1: Upload image file to Postiz
        image_id, image_path = upload_image_file(image_file, api_key, base_url)
        print(f"Image uploaded: id={image_id}", file=sys.stderr)

        # Step 2: Schedule post
        now = datetime.utcnow()
        hour, minute = map(int, posting_time.split(":"))
        schedule_dt = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        if schedule_dt <= now:
            schedule_dt += timedelta(days=1)

        posts = []
        for channel_id in channel_ids:
            posts.append({
                "integration": {"id": channel_id},
                "value": [
                    {
                        "content": caption,
                        "image": [{"id": image_id, "path": image_path}] if image_id else []
                    }
                ],
                "settings": {"post_type": "post"}
            })

        payload = {
            "type": "schedule",
            "date": schedule_dt.strftime("%Y-%m-%dT%H:%M:%S.000Z"),
            "shortLink": False,
            "tags": [],
            "posts": posts
        }

        req = urllib.request.Request(
            f"{base_url}/public/v1/posts",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": api_key
            }
        )

        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode("utf-8"))

        post_id = ""
        if isinstance(result, list) and len(result) > 0:
            post_id = result[0].get("postId", "")
        elif isinstance(result, dict):
            post_id = result.get("id", result.get("postId", ""))

        print(json.dumps({"postId": post_id, "status": "scheduled"}))
        print("Post scheduled successfully", file=sys.stderr)

    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else str(e)
        print(json.dumps({"error": f"Postiz API error: {e.code}", "details": error_body}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
