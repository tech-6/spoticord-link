import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Center,
  Container,
  createStyles,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import {
  IconInfoCircle,
  IconLink,
  IconLogout,
  IconUnlink,
} from "@tabler/icons";
import { motion } from "framer-motion";
import { withDiscordSsr } from "@lib/withSession";
import { useRouter } from "next/router";
import { CDN } from "@discordjs/rest";
import Image from "next/image";
import * as database from "@lib/database";

import discordLogo from "@images/discord-logo-blurple.svg";
import spotifyIcon from "@images/spotify-icon.png";
import Confirm from "@components/Confirm";
import { useState } from "react";
import { getCurrentUser } from "@lib/spotify";

interface HomePageProps {
  username: string;
  avatar: string;
  discriminator: string;

  spotify?: string;

  [key: string]: unknown;
}

const useStyles = createStyles((theme) => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",

    [theme.fn.smallerThan("xl")]: {
      alignItems: "center",
    },

    [theme.fn.smallerThan("xs")]: {
      padding: 0,
      minHeight: "100%",
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
      borderRadius: 0,
    },
  },

  description: {
    transform: `translateY(-60px)`,

    [theme.fn.smallerThan("xs")]: {
      transform: "none",
    },

    [`@media (max-height: 700px)`]: {
      transform: "none",
    },
  },

  account: {
    "& img": {
      width: 50,
      height: 50,

      [theme.fn.smallerThan("xs")]: {
        width: 32,
        height: 32,
      },
    },

    "& .mantine-Text-root:nth-of-type(1)": {
      fontSize: theme.fontSizes.xl,

      [theme.fn.smallerThan("xs")]: {
        fontSize: theme.fontSizes.md,
      },
    },

    "& .mantine-Text-root:nth-of-type(2)": {
      fontSize: theme.fontSizes.sm,

      [theme.fn.smallerThan("xs")]: {
        fontSize: theme.fontSizes.xs,
      },
    },

    "& .mantine-UnstyledButton-root": {
      width: 44,
      height: 44,

      "& svg": {
        width: 24,
        height: 24,
      },

      [theme.fn.smallerThan("xs")]: {
        width: 34,
        height: 34,

        "& svg": {
          width: 20,
          height: 20,
        },
      },
    },
  },
}));

export default function HomePage({
  username,
  avatar,
  discriminator,
  spotify: _spotify,
}: HomePageProps) {
  const { classes } = useStyles();

  const [spotify, setSpotify] = useState(_spotify);

  const theme = useMantineTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [discordModalOpened, setDiscordModalOpened] = useState(false);
  const [spotifyModalOpened, setSpotifyModalOpened] = useState(false);

  const onDiscordClicked = () => {
    // Only unlink is available on Discord
    setDiscordModalOpened(true);
  };

  const unlinkDiscord = () => {
    setLoading(true);

    fetch("/api/unlink/discord")
      .then(() => router.push("/login"))
      .catch(() => {
        // Show some error
      })
      .finally(() => setLoading(false));
  };

  const unlinkSpotify = () => {
    setLoading(true);

    fetch("/api/unlink/spotify")
      .then(() => setSpotify(undefined))
      .catch(() => {
        // Show some error
      })
      .finally(() => setLoading(false));
  };

  const onSpotifyClicked = async () => {
    if (spotify) {
      // Unlink
      setSpotifyModalOpened(true);
    } else {
      setLoading(true);

      fetch("/api/link/spotify", {
        method: "POST",
      })
        .then((resp) => resp.json())
        .then(({ token }) => router.push(`/spotify/${token}`))
        .catch(() => {
          // Show some error
        })
        .finally(() => setLoading(false));
    }
  };

  const onLogoutClicked = () => {
    setLoading(true);

    fetch("/api/logout")
      .then(() => router.push("/"))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

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
            <Box className={classes.description}>
              <Center>
                <Group>
                  <Avatar src={avatar} radius={1000} size="xl" />
                </Group>
              </Center>

              <Text align="center" mt="xl" size={24} weight={700}>
                Hello there, {username}
              </Text>

              <Text color="dimmed" align="center">
                Here you can manage your connected accounts for Spoticord
              </Text>
              <Paper mt="md" radius="md" sx={{ position: "relative" }}>
                <LoadingOverlay visible={loading} />

                <Group p="md" className={classes.account}>
                  <img src={spotifyIcon.src} alt="Spotify logo" />
                  <Stack spacing={0}>
                    <Text size={16} weight={700}>
                      Spotify
                    </Text>
                    <Text size="xs" color="dimmed">
                      {spotify
                        ? spotify
                        : "Click the button to link your Spotify account"}
                    </Text>
                  </Stack>
                  <Tooltip
                    label={
                      spotify
                        ? "Click to unlink account"
                        : "Click to link your Spotify account"
                    }
                  >
                    <ActionIcon
                      ml="auto"
                      color={spotify ? "red" : "green"}
                      variant="filled"
                      size="lg"
                      onClick={onSpotifyClicked}
                    >
                      {spotify ? <IconUnlink /> : <IconLink />}
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Group p="md" className={classes.account}>
                  <img src={discordLogo.src} alt="Discord logo" />
                  <Stack spacing={0}>
                    <Text size={20} weight={700}>
                      Discord
                    </Text>
                    <Text size="sm" color="dimmed">
                      {username}#{discriminator}
                    </Text>
                  </Stack>
                  <Tooltip label="Click to unlink your Discord account">
                    <ActionIcon
                      ml="auto"
                      color="red"
                      variant="filled"
                      onClick={onDiscordClicked}
                    >
                      <IconUnlink />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Paper>
            </Box>

            <Stack align={"flex-end"}>
              <Button
                leftIcon={<IconLogout />}
                color="red"
                onClick={onLogoutClicked}
                fullWidth
                loading={loading}
              >
                Log out
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </motion.div>

      {/* Modals */}
      <Confirm
        title="Unlink Discord account"
        description="Are you sure that you want to unlink your Discord account?"
        alert="Unlinking your Discord account will also sign you out of this page."
        color="blue"
        icon={<IconInfoCircle />}
        opened={discordModalOpened}
        onClose={(confirmed) => (
          confirmed && unlinkDiscord(), setDiscordModalOpened(false)
        )}
      />

      <Confirm
        title="Unlink Spotify account"
        description="Are you sure that you want to unlink your Spotify account?"
        alert="Unlinking your Spotify account will prevent you from using Spoticord."
        color="red"
        opened={spotifyModalOpened}
        onClose={(confirmed) => (
          confirmed && unlinkSpotify(), setSpotifyModalOpened(false)
        )}
      />
    </Container>
  );
}

// Path: pages/index.tsx
export const getServerSideProps = withDiscordSsr<HomePageProps>(
  async (user) => {
    const cdn = new CDN();
    const avatar = user.avatar
      ? cdn.avatar(user.id, user.avatar)
      : cdn.defaultAvatar(parseInt(user.discriminator) % 5);

    try {
      // Check if spotify is linked, if it is, get the username
      const spotify_token = await database.getUserSpotifyToken(user.id);

      return {
        props: {
          username: user.username,
          avatar,
          discriminator: user.discriminator,
          spotify: (await getCurrentUser(spotify_token)).display_name,
        },
      };
    } catch (ex) {
      const error = ex as database.APIError;

      if (error.status !== 404) {
        // Woopsie error, no intendo
        console.error(error);
      }

      return {
        props: {
          username: user.username,
          avatar,
          discriminator: user.discriminator,
        },
      };
    }
  }
);
