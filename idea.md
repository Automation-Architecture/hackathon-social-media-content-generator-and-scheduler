AI Social Auto-Content Generator (Product Structure)
1. Product Goal

A tool where users add topics + channels + schedule, and the system automatically generates images, captions, and schedules posts daily to social platforms.

Users only configure topics once.
The system generates content continuously.

2. Core Modules
Module 1 — User Authentication

Each user has isolated data.

Fields:

userId

name

email

plan

createdAt

Users should only see their own topics and content.

3. Frontend UI
Page 1 — Dashboard

Shows user statistics.

Cards:

Total Topics

Content Generated

Scheduled Posts

Pending Posts

Failed Posts

Table:
Recent content generated.

Columns:

Topic

Caption preview

Image preview

Status

Scheduled time

Platform

Page 2 — Topics (Main Configuration)

User creates automation topics.

Add Topic Form

Fields:

Topic Name
(example: AI Marketing Tips)

Idea / Context
(example: tips for founders about AI automation)

Post Type

Post

Reel

Both

Channel IDs

Instagram

LinkedIn

TikTok
(multiple allowed)

Posting Time
Example:

9 AM

3 PM

7 PM

Frequency

Daily

Weekly (optional later)

Status

Active

Paused

4. Database Design
Table: Users
users
-----
id
email
name
plan
created_at
Table: Topics

User configuration table.

topics
------
id
user_id
topic_name
idea_context
post_type
channel_ids (json)
posting_times (json)
status
created_at

Example:

topic_name: AI Marketing Tips
post_type: reel
posting_times: ["09:00","15:00"]
channels: ["instagram","linkedin"]
Table: Generated Content

Stores all generated content.

content
-------
id
user_id
topic_id
prompt
caption
image_url
preview_url
platform
post_type
scheduled_time
status
created_at
error_message

Status values:

pending
generated
scheduled
posted
failed
5. Automation Workflow

Runs daily.

Recommended: cron every hour

Example:

0 * * * *
Step 1 — Fetch Topics

Query:

select * from topics
where status = 'active'
Step 2 — Check Posting Time

For each topic:

If current time matches:

topic.posting_times

Then generate content.

6. Content Generation Pipeline
Step 1 — Generate Prompt

Send topic idea to OpenAI.

Example prompt:

Generate an image prompt and caption for Instagram.

Topic: AI marketing tips
Context: tips for founders

Output JSON:
{
image_prompt:
caption:
}

Output:

image_prompt
caption
Step 2 — Generate Image

Send prompt to Nano Banana image generator.

Result:

image_url
Step 3 — Store Content

Insert into content table.

status = generated
7. Media Storage

Two options.

Option A (Recommended)

Store images in S3 / Cloudflare R2

Reason:

scalable

faster

cheaper

permanent URLs

Avoid Google Drive.

8. Scheduling Posts

Use Postiz API.

Send:

image_url
caption
channel_id
scheduled_time

Response:

postiz_post_id

Update database.

status = scheduled
9. Error Handling

If any step fails:

Update:

status = failed
error_message

Dashboard shows this.

10. User Analytics

Dashboard metrics:

Queries:

Generated today

count(status='generated')

Scheduled

count(status='scheduled')

Failed

count(status='failed')

Posted

count(status='posted')
11. Multi-User Isolation

Every table includes:

user_id

Queries always filter:

WHERE user_id = current_user