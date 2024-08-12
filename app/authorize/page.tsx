import BlurFade from "@/components/magicui/blur-fade";
import Particles from "@/components/magicui/particles";
import ShineBorder from "@/components/magicui/shine-border";
import { db } from "@/db";
import { accounts, linkRequests } from "@/db/schema";
import { getUserInfo } from "@/lib/discord";
import { CDN } from "@discordjs/rest";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckIcon } from "lucide-react";
import { getCurrentUser, requestAccessToken } from "@/lib/spotify";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import ErrorCard from "@/components/error-card";

const ERRORS: { [key: string]: { title: string; message: string } } = {
  access_denied: {
    title: "Authentication cancelled",
    message:
      "You cancelled the authorization grant. You can now close this page, or try again if this was a mistake.",
  },
};

export default async function LinkAccountPage({
  searchParams: { code, error, state },
}: {
  searchParams: { code: string; error: string; state: string };
}) {
  // Redirect lost users to homepage
  if (!state) redirect("https://spoticord.com");

  const entry = await db.query.linkRequests.findFirst({
    where: eq(linkRequests.token, state),
  });

  if (!entry || entry.expires < new Date()) {
    return (
      <ErrorPage title="Session is invalid">
        The authentication parameters are either invalid, or the session might
        have expired. Please try again, or request a new link from the bot.
      </ErrorPage>
    );
  }

  if (error) {
    const errorProps = ERRORS[error] || {
      title: "Authentication failed",
      children:
        "An unknown error has occured while trying to link your Spotify account. Please try again, or request a new link from the bot.",
    };

    return <ErrorPage {...errorProps} />;
  }

  const result = await requestAccessToken(code);

  if ("error" in result) {
    return (
      <ErrorPage title="Authentication failed">
        Failed to authenticate with Spotify. Please try again, or request a new
        link from the bot.
      </ErrorPage>
    );
  }

  const { access_token, refresh_token, expires_in } = result;

  const user = await getCurrentUser(access_token);

  if (user.product !== "premium") {
    return (
      <ErrorPage title="Spotify Premium required">
        A Spotify Premium account is required to be able to use Spoticord.
        Without a Spotify Premium account, Spoticord is unable to function.
      </ErrorPage>
    );
  }

  await db.insert(accounts).values({
    user_id: entry.user_id,
    username: user.id,
    access_token,
    refresh_token,
    expires: new Date(Date.now() + expires_in * 1000),
  });

  // Delete link request after use
  await db.delete(linkRequests).where(eq(linkRequests.user_id, entry.user_id));

  const cdn = new CDN();
  const { avatar, id, discriminator } = await getUserInfo(entry.user_id);
  const icon = avatar
    ? cdn.avatar(id, avatar)
    : cdn.defaultAvatar(
        discriminator === "0000"
          ? Number((BigInt(id) >> 22n) % 6n)
          : Number(discriminator) % 5,
      );

  return (
    <div className="relative flex h-screen items-center justify-center">
      <BlurFade inView>
        <ShineBorder
          className="contents p-0 md:grid [&>div:first-child]:hidden md:[&>div:first-child]:block"
          color={["#444444", "#444444"]}
        >
          <Card className="flex min-h-full w-full flex-col rounded-none md:min-h-[auto] md:max-w-md md:rounded-md">
            <CardHeader className="flex items-center gap-4 bg-muted p-6">
              {/* Images */}
              <div className="relative flex w-full flex-row justify-center px-16">
                <div className="size-12 md:size-16"></div>

                <Avatar className="absolute z-20 size-12 -translate-x-4 md:size-16">
                  <AvatarImage src={icon} alt="User avatar" />
                </Avatar>

                <Avatar className="absolute z-10 size-12 translate-x-4 md:size-16">
                  <AvatarImage src="/spotify-logo.png" alt="Spotify logo" />
                </Avatar>
              </div>

              <div>
                <div className="flex items-center text-base font-medium md:text-lg">
                  <CheckIcon className="mr-2 size-6 text-green-500" />
                  Successfully linked account
                </div>
                <p className="text-xs text-muted-foreground md:text-sm">
                  Your Spotify account has successfully been linked to
                  Spoticord.
                </p>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-4 p-6">
              <div>
                <div className="text-sm font-medium md:text-base">
                  Time to fire up those tunes
                </div>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">
                  You may now close this page and return to Discord.
                  <br />
                  Use the <code>/join</code> command to start start using
                  Spoticord.
                </p>
              </div>

              {/* Tips */}
              <div className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  <div className="text-xs font-medium md:text-sm">
                    See what is being listened to
                  </div>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    Somebody else using the bot? Use the <code>/playing</code>{" "}
                    command to see what they&apos;re listening to!
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-xs font-medium md:text-sm">
                    Doing a karaoke session?
                  </div>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    Use the <code>/lyrics</code> command to see the (live
                    updating!) lyrics for the song that is being played, as long
                    as lyrics are available.
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="text-xs font-medium md:text-sm">
                    Want to be extra fancy?
                  </div>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    Rename your Spoticord device using the <code>/rename</code>{" "}
                    command, which will give the &quot;speaker&quot; in your
                    Spotify your newly given name!
                  </p>
                </div>
              </div>
            </CardContent>
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

type ErrorProps = {
  title: string;
};

function ErrorPage({ title, children }: React.PropsWithChildren<ErrorProps>) {
  return (
    <div className="relative flex h-screen items-center justify-center">
      <BlurFade inView>
        <ErrorCard title={title}>{children}</ErrorCard>
      </BlurFade>

      <Particles
        className="absolute inset-0 -z-10"
        quantity={200}
        ease={80}
        color="#ffffff"
        refresh
      />
    </div>
  );
}
