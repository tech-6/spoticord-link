# Spoticord Link

Spoticord Link is a Next.js application that enables users to connect their Spotify accounts to [Spoticord](https://github.com/SpoticordMusic/spoticord).

## Environment

|       Variable        | Description                                                                                                    |
| :-------------------: | -------------------------------------------------------------------------------------------------------------- |
|     DISCORD_TOKEN     | Any Discord bot token (can be different from a Spoticord instance), for resolving user information             |
|     DATABASE_URL      | A postgresql database URL, which must point to the same database as your Spoticord instance                    |
|   SPOTIFY_CLIENT_ID   | Your Spotify app Client ID                                                                                     |
| SPOTIFY_CLIENT_SECRET | Your spotify app Client Secret                                                                                 |
| SPOTIFY_REDIRECT_URI  | The full URI to redirect to after (un)successful Spotify authentication (e.g. http://localhost:3000/authorize) |
