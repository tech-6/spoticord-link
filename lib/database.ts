interface User {
  id: string;
  device_name: string;
  request?: Request;
  accounts?: any[];
}

interface Account {
  user_id: string;
  type: "discord" | "spotify";
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface Request {
  token: string;
  user_id: string;
  expires: number;
}

interface SpotifyAppInfo {
  client_id: string;
}

interface DiscordAppInfo {
  client_id: string;
}

interface SpotifyTokenInfo {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface DiscordTokenInfo {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export class APIError extends Error {
  constructor(
    public readonly status: number,
    message?: string,
    options?: ErrorOptions
  ) {
    super(message, options);
  }
}

const { DATABASE_URL } = process.env;

export async function getUserByRequest(token: string): Promise<User> {
  const response = await fetch(`${DATABASE_URL}/user/by-request/${token}`);

  if (!response.ok) throw new APIError(response.status);

  return await response.json();
}

export async function getUserAvatar(user_id: string): Promise<string> {
  const response = await fetch(`${DATABASE_URL}/discord/avatar/${user_id}`);

  return (await response.json()).avatar;
}

export async function getUserDiscordToken(user_id: string): Promise<string> {
  const response = await fetch(
    `${DATABASE_URL}/user/${user_id}/discord/access_token`
  );

  if (!response.ok) throw new APIError(response.status);

  return (await response.json()).access_token;
}

export async function revokeDiscordToken(access_token: string): Promise<void> {
  const response = await fetch(`${DATABASE_URL}/discord/token/revoke`, {
    method: "POST",
    body: JSON.stringify({ access_token }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new APIError(response.status);
}

export async function getUserSpotifyToken(user_id: string): Promise<string> {
  const response = await fetch(
    `${DATABASE_URL}/user/${user_id}/spotify/access_token`
  );

  if (!response.ok) throw new APIError(response.status);

  return (await response.json()).access_token;
}

export async function getSpotifyAppInfo(): Promise<SpotifyAppInfo> {
  const response = await fetch(`${DATABASE_URL}/spotify/appinfo`);

  return await response.json();
}

export async function getDiscordAppInfo(): Promise<DiscordAppInfo> {
  const response = await fetch(`${DATABASE_URL}/discord/appinfo`);

  return await response.json();
}

export async function getRequestByUserId(user_id: string): Promise<Request> {
  const response = await fetch(`${DATABASE_URL}/request/by-user/${user_id}`);

  if (!response.ok) throw new APIError(response.status, await response.text());

  return await response.json();
}

/**
 * Acquire a Spotify access token for a user.
 *
 * @param code OAuth2 code received from Spotify
 * @returns An object which contains the token information
 */
export async function requestSpotifyToken(
  code: string
): Promise<SpotifyTokenInfo> {
  const response = await fetch(`${DATABASE_URL}/spotify/token/acquire`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    }),
  });

  if (!response.ok) throw new APIError(response.status);

  return await response.json();
}

/**
 * Acquire a Discord access token for a user.
 *
 * @param code OAuth2 code received from Discord
 * @returns An object which contains the token information
 */
export async function requestDiscordToken(
  code: string
): Promise<DiscordTokenInfo> {
  const response = await fetch(`${DATABASE_URL}/discord/token/acquire`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
    }),
  });

  if (!response.ok) throw new APIError(response.status);

  return await response.json();
}

export async function createOrUpdateAccount({
  user_id,
  type,
  access_token,
  refresh_token,
  expires_in,
}: Account) {
  const data = {
    user_id,
    type,
    access_token,
    refresh_token,
    expires: Math.floor(Date.now() / 1000) + expires_in,
  };

  const response = await fetch(`${DATABASE_URL}/account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new APIError(response.status, (await response.json()).error);
  }
}

export async function createRequest(user_id: string): Promise<Request> {
  const response = await fetch(`${DATABASE_URL}/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id,
      expires: Math.floor(Date.now() / 1000) + 3600,
    }),
  });

  if (!response.ok) throw new APIError(response.status, await response.text());

  return await response.json();
}

export async function deleteRequest(user_id: string) {
  const response = await fetch(`${DATABASE_URL}/request/${user_id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new APIError(response.status);
}

export async function deleteAccount(
  user_id: string,
  type: "spotify" | "discord"
) {
  const response = await fetch(`${DATABASE_URL}/account/${user_id}/${type}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new APIError(response.status);
}
