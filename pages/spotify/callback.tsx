import {
  Accordion,
  Alert,
  Avatar,
  Box,
  Button,
  Center,
  Container,
  createStyles,
  Group,
  Paper,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  IconPlus,
  IconAlertTriangle,
  IconBrandSpotify,
  IconX,
  IconCircleX,
  IconLogout,
  IconCircleCheck,
} from "@tabler/icons";
import { motion } from "framer-motion";
import * as database from "@lib/database";

import spotifyIcon from "@images/spotify-icon.png";
import { withSessionSsr } from "@lib/withSession";
import IconCard from "@components/IconCard";
import { randomBytes } from "crypto";
import * as spotify from "@lib/spotify";

interface SpotifyLinkPageProps {
  url: string;
  avatar: string;
  error?: "invalid_token" | "expired";
}

const useStyles = createStyles((theme) => ({
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  },

  wrapper: {
    width: "500px",
    minHeight: "600px",
  },

  container: {
    height: "100%",
    background: theme.colors.dark[6],
    padding: theme.spacing.xl,
    borderRadius: theme.radius.md,
  },
}));

export default function SpotifyLinkPage({
  url,
  avatar,
  error,
}: SpotifyLinkPageProps) {
  const { classes } = useStyles();

  const theme = useMantineTheme();

  const ERRORS: { [key: string]: [string, JSX.Element, JSX.Element] } = {
    // User cancelled the login
    access_denied: [
      "Account connection failed",
      <>
        <Text align="center" color="dimmed">
          You have cancelled the connection process
        </Text>
      </>,
      <IconLogout
        size={64}
        color={theme.colors.red[5]}
        style={{ display: "block" }}
      />,
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
      <IconCircleX
        stroke={1.5}
        size={64}
        color={theme.colors.red[5]}
        style={{ display: "block" }}
      />,
    ],

    // The code provided is invalid
    code_invalid: [
      "Invalid code received",
      <>
        <Text align="center" color="dimmed">
          The authorization code provided is invalid. Please try again.
        </Text>
      </>,
      <IconCircleX
        stroke={1.5}
        size={64}
        color={theme.colors.red[5]}
        style={{ display: "block" }}
      />,
    ],

    premium_required: [
      "Premium account required",
      <>
        <Text align="center" color="dimmed">
          You need a Spotify Premium account to be able to use Spoticord
        </Text>
      </>,
      <IconCircleX
        stroke={1.5}
        size={64}
        color={theme.colors.red[5]}
        style={{ display: "block" }}
      />,
    ],
  };

  const onCancelButtonClicked = () => {
    window.close();
    window.location.href = "/";
  };

  const onAuthorizeButtonClicked = () => {
    window.open(url);
  };

  if (error)
    return (
      <IconCard
        icon={ERRORS[error][2]}
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
    />
  );
}

// Path: pages/spotify/[token].tsx
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
    const [request, csrf_token] = state.split(":");
    const { token: client_csrf_token } = req.session;

    // req.session.destroy();

    if (csrf_token !== client_csrf_token) {
      console.warn("CSRF token mismatch");

      return { props: { error: "bad_request" } };
    }

    const user = await database.getUserByRequest(request);

    if (user.request!.expires < Math.floor(Date.now() / 1000)) {
      return { props: { error: "bad_request" } };
    }

    const { access_token, refresh_token, expires_in } =
      await database.requestSpotifyToken(code);

    const product = (await spotify.getCurrentUser(access_token)).product;

    if (product !== "premium") {
      return { props: { error: "premium_required" } };
    }

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
