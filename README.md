# ed-poster

ed-poster crossposts all posts and announcements from Ed Discussion into Discord, with a button to view the original post in Ed Discussion. Announcements are posted to an announcements channel, and other posts are posted to a feed channel.

## Prerequisites

ed-poster runs on Cloudflare Workers for free.

You will need:
* A [Cloudflare account](https://dash.cloudflare.com/sign-up)
* [Node.js](https://nodejs.org/en) installed locally
* A Discord server, where you have Manage Webhook permissions

## Setup

First, clone this repository and run `pnpm i`. (If pnpm isn't installed, run `corepack enable` first.) Copy wrangler.example.toml to wrangler.toml and courses.example.json to courses.json.

Create an [Ed API token](https://edstem.org/us/settings/api-tokens). Run `pnpm set-token` and type in the API token when prompted. You may be prompted to log in to your Cloudflare account first.

Run `pnpm create-kv`, then copy the provided binding ID into wrangler.toml.

In courses.json, set the `courseID`	to a unique string for the course, and set `edID` to the numeric course ID in the Ed URL.

In Discord channel settings, go to the Integrations tab and create a webhook. Copy the new webhook's URL and set it as `announcementWebhook` in courses.json.

Do the same for the feed channel, setting the second webhook's `url` as `feedWebhook`.

When you're done, run `pnpm run deploy`. ed-poster will now check every minute for new Ed posts and send them to the appropriate Discord channel.
