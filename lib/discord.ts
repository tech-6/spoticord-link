import { REST } from "@discordjs/rest";
import { APIUser, Routes } from "discord-api-types/v10";

export async function getUserInfo(id: string): Promise<APIUser> {
  const client = new REST().setToken(process.env.DISCORD_TOKEN!);
  return (await client.get(Routes.user(id))) as APIUser;
}
