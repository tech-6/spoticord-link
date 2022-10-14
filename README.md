# Spoticord Accounts

Relatively simple webapp for managing linked accounts for Spoticord

# Environment variables

|       Variable       | Description                                                                                                                                   | Required | Default |
| :------------------: | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
|         PORT         | The port number to listen on                                                                                                                  | No       | 3000    |
|     DATABASE_URL     | The base URL of [the Database API](https://SpoticordMusic/spoticord-database) **without** trailing slash _(e.g. http://database.example.com)_ | Yes      | _N/A_   |
| SPOTIFY_REDIRECT_URI | The URI to redirect to after (un)successful Spotify authentication                                                                            | Yes      | _N/A_   |
| DISCORD_REDIRECT_URI | The URI to redirect to after (un)successful Discord authentication                                                                            | Yes      | _N/A_   |
