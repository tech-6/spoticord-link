# Spoticord Accounts

Relatively simple webapp for managing linked accounts for Spoticord

# Environment variables

|       Variable       | Description                                                                                                                                              | Required | Default |
| :------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
|   SESSION_PASSWORD   | The secret to encrypt session cookies, must be at least 32 characters long                                                                               | Yes      | _N/A_   |
|         PORT         | The port number to listen on                                                                                                                             | No       | 3000    |
|     DATABASE_URL     | The base URL of [the Database API](https://github.com/SpoticordMusic/spoticord-database) **without** trailing slash _(e.g. http://database.example.com)_ | Yes      | _N/A_   |
| SPOTIFY_REDIRECT_URI | The URI to redirect to after (un)successful Spotify authentication (callback is located at /spotify/callback)                                            | Yes      | _N/A_   |
| DISCORD_REDIRECT_URI | The URI to redirect to after (un)successful Discord authentication (callback is located at /login/callback)                                              | Yes      | _N/A_   |
