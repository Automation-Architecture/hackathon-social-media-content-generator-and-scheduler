#!/usr/bin/env python3
"""
Calls OpenAI GPT to generate an infographic script + LinkedIn caption.
Output: JSON { "script": "...", "caption": "..." } on stdout.
Logs go to stderr.
"""

import argparse
import json
import os
import sys
import urllib.request


def main():
    parser = argparse.ArgumentParser(description="Generate script + caption via OpenAI")
    parser.add_argument("--title", help="Topic name")
    parser.add_argument("--system-prompt", help="System prompt template")
    parser.add_argument("--master-prompt", help="Master/user prompt template")
    parser.add_argument("--input-file", help="JSON file with title, systemPrompt, masterPrompt")
    args = parser.parse_args()

    # Load from input file if provided (avoids CLI arg issues with long text)
    if args.input_file:
        with open(args.input_file) as f:
            data = json.load(f)
        title = data["title"]
        system_prompt_raw = data["systemPrompt"]
        master_prompt_raw = data["masterPrompt"]
    else:
        title = args.title
        system_prompt_raw = args.system_prompt
        master_prompt_raw = args.master_prompt

    if not title:
        print(json.dumps({"error": "title is required"}))
        sys.exit(1)

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        env_path = os.path.join(os.path.dirname(__file__), "..", "backend", ".env")
        if os.path.exists(env_path):
            with open(env_path) as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("OPENAI_API_KEY="):
                        api_key = line.split("=", 1)[1]
                        break

    if not api_key:
        print(json.dumps({"error": "OPENAI_API_KEY not set"}))
        sys.exit(1)

    system_prompt = system_prompt_raw.replace("{{ title }}", title).replace("{{ $json.title }}", title)
    master_prompt = master_prompt_raw.replace("{{ title }}", title).replace("{{ $json.title }}", title)

    print(f"Generating script for: {title}", file=sys.stderr)

    payload = {
        "model": "gpt-4o",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": master_prompt}
        ],
        "temperature": 0.9,
        "max_tokens": 4000
    }

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
    )

    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read().decode("utf-8"))

        content = result["choices"][0]["message"]["content"]

        # Parse the response — extract script (image prompt) and caption
        script = ""
        caption = ""

        sections = content.split("---")
        for section in sections:
            section_lower = section.lower()
            if "image generation prompt" in section_lower or "detailed image" in section_lower:
                # Remove the header line
                lines = section.strip().split("\n")
                script_lines = [l for l in lines if not l.strip().startswith("##")]
                script = "\n".join(script_lines).strip()
            elif "linkedin post caption" in section_lower or "caption" in section_lower:
                lines = section.strip().split("\n")
                caption_lines = [l for l in lines if not l.strip().startswith("##")]
                caption = "\n".join(caption_lines).strip()

        # Fallback: if parsing fails, use the whole response
        if not script and not caption:
            script = content
            caption = ""

        print(json.dumps({"script": script, "caption": caption}))
        print("Script generated successfully", file=sys.stderr)

    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else str(e)
        print(json.dumps({"error": f"OpenAI API error: {e.code}", "details": error_body}))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
