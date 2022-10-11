import { createStyles, Text, useMantineTheme } from "@mantine/core";
import { IconCircleX, IconLogout, IconCircleCheck } from "@tabler/icons";
import * as database from "@lib/database";
import { withSessionSsr } from "@lib/withSession";
import IconCard from "@components/IconCard";
import * as spotify from "@lib/spotify";

interface SpotifyCallbackPageProps {
  error?: "access_denied" | "bad_request" | "code_invalid" | "premium_required";
}

export default function SpotifyCallbackPage({
  error,
}: SpotifyCallbackPageProps) {
  const theme = useMantineTheme();

  const ERRORS: { [key: string]: [string, JSX.Element] } = {
    // User cancelled the login
    access_denied: [
      "Account connection failed",
      <>
        <Text align="center" color="dimmed">
          You have cancelled the connection process
        </Text>
      </>,
    ],

    // Invalid query params, CSRF mismatch, or state is invalid (mismatch or expired)
    bad_request: [
      "Invalid request received",
      <>
        <Text align="center" color="dimmed">
          The request received from the browser was invalid or cannot be served.
        </Text>
        <Text align="center" color="dimmed">
          If the problem keeps happening, please restart your browser and try
          again.
        </Text>
      </>,
    ],

    // The code provided is invalid
    code_invalid: [
      "Invalid code received",
      <>
        <Text align="center" color="dimmed">
          The authorization code provided is invalid. Please try again.
        </Text>
      </>,
    ],

    premium_required: [
      "Premium account required",
      <>
        <Text align="center" color="dimmed">
          You need a Spotify Premium account to be able to use Spoticord
        </Text>
      </>,
    ],
  };

  if (error)
    return (
      <IconCard
        icon={
          <IconCircleX
            stroke={1.5}
            size={64}
            color={theme.colors.red[5]}
            style={{ display: "block" }}
          />
        }
        title={ERRORS[error][0]}
        description={ERRORS[error][1]}
        close
      />
    );

  return (
    <IconCard
      icon={
        <IconCircleCheck
          stroke={1.5}
          size={64}
          color={theme.colors.teal[5]}
          style={{ display: "block" }}
        />
      }
      title="Successfully linked Spotify"
      description={
        <>
          <Text align="center" color="dimmed">
            Your Spotify account has successfully been linked with Spoticord.
          </Text>
        </>
      }
      close
      closeColor="teal"
    />
  );
}

export const getServerSideProps = withSessionSsr(async ({ req, query }) => {
  const { code, error, state } = query;

  if (error) {
    return { props: { error } };
  }

  // No code, no party
  if (
    !state ||
    typeof state !== "string" ||
    !state.includes(":") ||
    !code ||
    typeof code !== "string"
  ) {
    return { props: { error: "bad_request" } };
  }

  try {
    // Check for CSRF mismatches
    const [request, csrf_token] = state.split(":");
    const { csrf_token: client_csrf_token } = req.session;

    if (csrf_token !== client_csrf_token) {
      console.warn("CSRF token mismatch");

      return { props: { error: "bad_request" } };
    }

    const user = await database.getUserByRequest(request);

    // Drop expired requests
    if (user.request!.expires < Math.floor(Date.now() / 1000)) {
      return { props: { error: "bad_request" } };
    }

    const { access_token, refresh_token, expires_in } =
      await database.requestSpotifyToken(code);

    const product = (await spotify.getCurrentUser(access_token)).product;

    // No premium, no party
    if (product !== "premium") {
      return { props: { error: "premium_required" } };
    }

    // Insert Spotify account into database
    try {
      await database.createAccount({
        access_token,
        refresh_token,
        expires_in,
        user_id: user.id,
      });
    } catch (ex) {
      return { props: { error: "bad_request" } };
    }

    // No repeatsies
    await database.deleteRequest(user.id);

    return { props: {} };
  } catch (ex: any) {
    if (ex.status === 404) {
      return { props: { error: "bad_request" } };
    } else if (ex.status === 400) {
      return { props: { error: "code_invalid" } };
    }

    throw ex;
  }

  // Make TypeScript happy even though this is unreachable code :/
  return { notFound: true };
});
