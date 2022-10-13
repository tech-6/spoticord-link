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
} from "@tabler/icons";
import { motion } from "framer-motion";
import * as database from "@lib/database";

import spotifyIcon from "@images/spotify-icon.png";
import { withSessionSsr } from "@lib/withSession";
import IconCard from "@components/IconCard";
import { randomBytes } from "crypto";
import { useRouter } from "next/router";
import Head from "next/head";

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

    [theme.fn.smallerThan("md")]: {
      alignItems: "center",
    },

    [theme.fn.smallerThan("xs")]: {
      padding: 0,
    },
  },

  wrapper: {
    width: "500px",
    minHeight: "600px",

    [theme.fn.smallerThan("xs")]: {
      width: "100%",
      minHeight: "100%",
    },
  },

  container: {
    height: "100%",
    background: theme.colors.dark[6],
    padding: theme.spacing.xl,
    borderRadius: theme.radius.md,

    [theme.fn.smallerThan("xs")]: {
      margin: 0,
      width: "100vw",
      height: "100vh",
    },
  },
}));

const SCOPES: [string, string, any][] = [
  [
    "streaming",
    "Take actions in Spotify on your behalf",
    <>
      <Text>Stream and control Spotify on your other devices.</Text>
      <Text color="dimmed" size="sm">
        This is required for Spoticord to be able to read and control your
        playback.
      </Text>
    </>,
  ],
  [
    "user-read-private",
    "View your Spotify account data",
    <>
      <Text>
        The type of Spotify subscription you have, your account country and your
        settings for explicit content filtering.
      </Text>
      <Text color="dimmed" size="sm">
        This is used by Spoticord to determine if your account is elligible to
        use the bot, and may be used for moderation features in the future.
      </Text>
      <Text mt="lg">
        Your name and username, your profile picture, how many followers you
        have on Spotify and your public playlists.
      </Text>
      <Text color="dimmed" size="sm">
        This permission is granted by default.
      </Text>
    </>,
  ],
];

const ERRORS: { [key: string]: [string, JSX.Element] } = {
  invalid_token: [
    "Invalid request code",
    <>
      <Text align="center" color="dimmed">
        The request code you provided is invalid.
      </Text>
      <Text align="center" color="dimmed">
        Please obtain a new code and try again.
      </Text>
    </>,
  ],

  expired: [
    "Request code expired",
    <>
      <Text align="center" color="dimmed">
        The request code you provided has expired.
      </Text>
      <Text align="center" color="dimmed">
        Please obtain a new code and try again.
      </Text>
    </>,
  ],
};

export default function SpotifyLinkPage({
  url,
  avatar,
  error,
}: SpotifyLinkPageProps) {
  const { classes, cx } = useStyles();

  const theme = useMantineTheme();
  const router = useRouter();

  const onCancelButtonClicked = () => {
    window.close();
    router.push("/");
  };

  if (error)
    return (
      <>
        <Head>
          <title>{`${ERRORS[error][0]} | Spoticord Accounts`}</title>
        </Head>
        <IconCard
          icon={
            <IconCircleX
              color={theme.colors.red[5]}
              size={64}
              stroke={1.5}
              style={{ display: "block" }}
            />
          }
          title={ERRORS[error][0]}
          description={ERRORS[error][1]}
          close
        />
      </>
    );

  return (
    <Container className={classes.root}>
      <motion.div
        className={classes.wrapper}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <Paper className={classes.container} shadow={"sm"}>
          <Stack sx={{ height: "100%" }} justify="space-between">
            <Box>
              <Center>
                <Group>
                  <Avatar src={avatar} radius={1000000} size="xl" />
                  <IconPlus size={64} color="white" />
                  <Avatar src={spotifyIcon.src} radius={1000000} size="xl" />
                </Group>
              </Center>

              <Text align="center" mt="xl" size={24} weight={700}>
                Link your Spotify account
              </Text>

              <Text color="dimmed" align="center">
                To use Spoticord, you must grant the following permissions
              </Text>
              <Paper mt="md">
                <Accordion defaultValue={"streaming"}>
                  {SCOPES.map(([scope, title, description]) => (
                    <Accordion.Item key={scope} value={scope}>
                      <Accordion.Control>
                        <strong>{title}</strong>
                      </Accordion.Control>
                      <Accordion.Panel>{description}</Accordion.Panel>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Paper>
            </Box>

            <Stack align={"flex-end"}>
              <Alert
                sx={{ width: "100%" }}
                icon={<IconAlertTriangle />}
                title="Premium account required"
              >
                The use of a Spotify premium account is mandatory
              </Alert>

              <Group>
                <Button
                  leftIcon={<IconX />}
                  color="red"
                  onClick={onCancelButtonClicked}
                >
                  Cancel
                </Button>
                <Button
                  component="a"
                  href={url}
                  leftIcon={<IconBrandSpotify />}
                >
                  Connect Spotify
                </Button>
              </Group>
            </Stack>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
}

// Path: pages/spotify/[token].tsx
export const getServerSideProps = withSessionSsr(async ({ params, req }) => {
  // Check if the token is valid
  if (!params || !params.token || typeof params.token !== "string") {
    return {
      notFound: true,
    };
  }

  const { token } = params;

  try {
    // Fetch user
    const user = await database.getUserByRequest(token);

    // Check if token has expired
    if (user.request!.expires < Math.floor(Date.now() / 1000)) {
      return {
        props: {
          error: "expired",
        },
      };
    }

    const avatar = await database.getUserAvatar(user.id);
    const client_id = (await database.getSpotifyAppInfo()).client_id;

    req.session.csrf_token = randomBytes(32).toString("hex");

    const url = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(
      process.env.REDIRECT_URI as string
    )}&state=${encodeURIComponent(
      `${token}:${req.session.csrf_token}`
    )}&scope=${SCOPES.map((scope) => scope[0]).join("+")}&show_dialog=true`;

    await req.session.save();

    return {
      props: {
        token,
        avatar,
        url,
      },
    };
  } catch (ex: any) {
    if (ex.status === 404) {
      return {
        props: {
          error: "invalid_token",
        },
      };
    }

    throw ex;
  }
});
