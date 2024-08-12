import BlurFade from "@/components/magicui/blur-fade";
import Particles from "@/components/magicui/particles";
import ShineBorder from "@/components/magicui/shine-border";
import { db } from "@/db";
import { linkRequests } from "@/db/schema";
import { getUserInfo } from "@/lib/discord";
import { CDN } from "@discordjs/rest";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AnimatedUserIcon } from "./components";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function LinkAccountPage({
  params: { request },
}: {
  params: { request: string };
}) {
  const entry = await db.query.linkRequests.findFirst({
    where: eq(linkRequests.token, request),
  });

  if (!entry || entry.expires < new Date()) {
    notFound();
  }

  const cdn = new CDN();
  const user = await getUserInfo(entry.user_id);
  const avatar = user.avatar
    ? cdn.avatar(user.id, user.avatar)
    : cdn.defaultAvatar(
        user.discriminator === "0000"
          ? Number((BigInt(user.id) >> 22n) % 6n)
          : Number(user.discriminator) % 5,
      );

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    scope: ["user-read-private", "streaming"].join(","),
    state: request,
    show_dialog: "true",
  });
  const authorizeUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;

  return (
    <div className="relative flex h-full items-center justify-center">
      <BlurFade inView yOffset={12}>
        <ShineBorder
          className="contents p-0 md:grid [&>div:first-child]:hidden md:[&>div:first-child]:block"
          color={["#444444", "#444444"]}
        >
          <Card className="flex min-h-full w-full flex-col rounded-none md:min-h-[auto] md:max-w-md md:rounded-md">
            <CardHeader className="flex items-center gap-4 bg-muted p-6">
              {/* Images */}
              <AnimatedUserIcon image={avatar} />

              <div className="w-full">
                <div className="text-base font-medium md:text-lg">
                  Link your Spotify account
                </div>
                <p className="text-xs text-muted-foreground md:text-sm">
                  Connect your Spotify account to Spoticord, and listen to the
                  music you enjoy.
                </p>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col justify-between space-y-4 p-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium md:text-base">
                    We need some permissions first
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground md:text-base">
                    Spoticord needs a few permissions from your Spotify account
                    to work its magic!
                  </p>
                </div>

                {/* Permissions */}
                <div className="space-y-4">
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-xs font-medium md:text-sm">
                      Read subscription details
                    </div>
                    <p className="text-xs text-muted-foreground md:text-sm">
                      Spoticord needs to be able to determine whether your
                      account has Spotify Premium, which is{" "}
                      <strong>required</strong> for Spoticord to function.
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-xs font-medium md:text-sm">
                      Control device playback
                    </div>
                    <p className="text-xs text-muted-foreground md:text-sm">
                      Spoticord needs to be able to create devices and control
                      their playback within your Spotify account to function.
                    </p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-xs font-medium md:text-sm">
                      Basic profile information
                    </div>
                    <p className="text-xs text-muted-foreground md:text-sm">
                      Spoticord needs to know your username to be able to
                      authenticate with Spotify servers.
                    </p>
                  </div>
                  <Separator />
                </div>
              </div>
            </CardContent>

            <CardFooter className="relative flex-1 items-end overflow-hidden">
              <div className="flex w-full items-end">
                <Button variant="outline" className="ml-auto mr-0" asChild>
                  <a href={authorizeUrl}>
                    <ExternalLinkIcon className="mr-2 size-4" />
                    Authenticate with Spotify
                  </a>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </ShineBorder>
      </BlurFade>

      <Particles
        className="absolute inset-0 -z-10 hidden md:block"
        quantity={200}
        ease={80}
        color="#ffffff"
        refresh
      />
    </div>
  );
}
