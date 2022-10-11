interface User {
  id: string;
  donator: boolean;
  device_name: string;
  request?: Request;
  accounts?: any[];
}

interface Request {
  token: string;
  user_id: string;
  expires: number;
}

interface AppInfo {
  client_id: string;
}

interface TokenInfo {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

class APIError extends Error {
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

export async function getSpotifyAppInfo(): Promise<AppInfo> {
  const response = await fetch(`${DATABASE_URL}/spotify/appinfo`);

  return await response.json();
}

export async function requestSpotifyToken(code: string): Promise<TokenInfo> {
  const response = await fetch(`${DATABASE_URL}/spotify/token/acquire`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      redirect_uri: process.env.REDIRECT_URI,
    }),
  });

  if (!response.ok) throw new APIError(response.status);

  return await response.json();
}

export async function createAccount({
  user_id,
  access_token,
  refresh_token,
  expires_in,
}: {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}) {
  const data = {
    user_id,
    type: "spotify",
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

export async function deleteRequest(user_id: string) {
  const response = await fetch(`${DATABASE_URL}/request/${user_id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new APIError(response.status);
}
