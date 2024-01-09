# ed-poster

ed-poster crossposts all posts and announcements from Ed Discussion into Discord, with a button to view the original post in Ed Discussion. Announcements are posted to an announcements channel, and other posts are posted to a feed channel.

## Prerequisites

ed-poster runs on Cloudflare Workers for free.

You will need:
* A [Cloudflare account](https://dash.cloudflare.com/sign-up)
* [Node.js](https://nodejs.org/en) installed locally
* A Discord server
* A [Discord bot](https://discord.com/developers/applications) token with Manage Webhook permissions in the server

## Setup

First, clone this repository and run `pnpm i`. (If pnpm isn't installed, run `corepack enable` first.) Copy wrangler.example.toml to wrangler.toml and courses.example.json to courses.json.

Create an [Ed API token](https://edstem.org/us/settings/api-tokens). Run `pnpm set-token` and type in the API token when prompted. You may be prompted to log in to your Cloudflare account first.

Run `pnpm create-kv`, then copy the provided binding ID into wrangler.toml.

In courses.json, set the `courseID`	to a unique string for the course, and set `edID` to the numeric course ID in the Ed URL.

With the Discord bot token, [create a webhook](https://discord.com/developers/docs/resources/webhook#create-webhook) in the announcements channel using the API. POST to https://discord.com/api/v10/channels/CHANNELID/webhooks with `{ "name": "Ed" }`, with the [authorization header](https://discord.com/developers/docs/reference#authentication). You cannot create the webhook in the Discord app, you must use a bot. Take the `url` field in the response and set it as `announcementWebhook` in courses.json.

Do the same for the feed channel, setting the second webhook's `url` as `feedWebhook`.

When you're done, run `pnpm run deploy`. ed-poster will now check every minute for new Ed posts and send them to the appropriate Discord channel.
