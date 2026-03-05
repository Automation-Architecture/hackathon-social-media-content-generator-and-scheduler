#!/usr/bin/env python3
"""
Calls Google Gemini API to generate an infographic image from a script/prompt.
Output: JSON { "imageUrl": "..." } on stdout.
Logs go to stderr.
Saves generated image to backend/data/images/ and returns a local URL.
"""

import argparse
import base64
import json
import os
import sys
import urllib.request
import uuid


def main():
    parser = argparse.ArgumentParser(description="Generate image via Google Gemini")
    parser.add_argument("--script", help="Image generation prompt/script")
    parser.add_argument("--input-file", help="JSON file with script field")
    args = parser.parse_args()

    if args.input_file:
        with open(args.input_file) as f:
            data = json.load(f)
        script_text = data["script"]
    else:
        script_text = args.script

    if not script_text:
        print(json.dumps({"error": "script is required"}))
        sys.exit(1)

    api_key = os.environ.get("NANO_BANANA_API_KEY")
    if not api_key:
        env_path = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
        if os.path.exists(env_path):
            with open(env_path) as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("NANO_BANANA_API_KEY="):
                        api_key = line.split("=", 1)[1]
                        break

    if not api_key:
        print(json.dumps({"error": "NANO_BANANA_API_KEY not set"}))
        sys.exit(1)

    print("Generating image via Google Gemini...", file=sys.stderr)

    # Gemini API - generateContent with image generation
    url = f"https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key={api_key}"

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": f"Generate a professional infographic image based on this description. Make it high quality, clean, and visually stunning:\n\n{script_text}"
                    }
                ]
            }
        ],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"]
        }
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json"
        }
    )

    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode("utf-8"))

        # Extract image from Gemini response
        image_data = None
        mime_type = "image/png"

        candidates = result.get("candidates", [])
        for candidate in candidates:
            parts = candidate.get("content", {}).get("parts", [])
            for part in parts:
                if "inlineData" in part:
                    image_data = part["inlineData"].get("data")
                    mime_type = part["inlineData"].get("mimeType", "image/png")
                    break
            if image_data:
                break

        if not image_data:
            # Maybe the model returned text instead of image
            text_response = ""
            for candidate in candidates:
                parts = candidate.get("content", {}).get("parts", [])
                for part in parts:
                    if "text" in part:
                        text_response += part["text"]
            print(json.dumps({"error": "No image in Gemini response", "text": text_response[:500]}))
            sys.exit(1)

        # Save image to disk
        images_dir = os.path.join(os.path.dirname(__file__), "..", "backend", "data", "images")
        os.makedirs(images_dir, exist_ok=True)

        ext = "png" if "png" in mime_type else "jpg"
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(images_dir, filename)

        with open(filepath, "wb") as f:
            f.write(base64.b64decode(image_data))

        # Return URL that Express can serve
        image_url = f"http://localhost:3001/images/{filename}"

        print(json.dumps({"imageUrl": image_url}))
        print(f"Image saved: {filepath}", file=sys.stderr)

    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else str(e)
        print(json.dumps({"error": f"Gemini API error: {e.code}", "details": error_body}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
