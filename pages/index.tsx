import {
  ActionIcon,
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
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { IconLink, IconLogout, IconUnlink } from "@tabler/icons";
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

interface HomePageProps {
  username: string;
  avatar: string;
  discriminator: string;

  spotify?: string;

  [key: string]: unknown;
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

  const [discordModalOpened, setDiscordModalOpened] = useState(false);

  const onDiscordClicked = () => {
    // Only unlink is available on Discord
    setDiscordModalOpened(true);
  };

  const unlinkDiscord = async () => {
    // Unlink Discord
  };

  const unlinkSpotify = async () => {
    setSpotify("");
  };

  const onLogoutClicked = () => {
    window.close();
    router.push("/");
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
              <Paper mt="md" radius="md">
                <Group p="md">
                  <Image src={spotifyIcon} width={50} height={50} />
                  <Stack spacing={0}>
                    <Text size={20} weight={700}>
                      Spotify
                    </Text>
                    <Text size="sm" color="dimmed">
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
                      size="xl"
                      onClick={unlinkSpotify}
                    >
                      {spotify ? <IconUnlink /> : <IconLink />}
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Group p="md">
                  <Image src={discordLogo} width={50} height={50} />
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
                      size="xl"
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
        color="red"
        opened={discordModalOpened}
        onClose={() => setDiscordModalOpened(false)}
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
      const swag = await database.getUserSpotifyToken(user.id);

      console.log(swag);
    } catch (ex) {
      const error = ex as database.APIError;

      if (error.status !== 404) {
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

    return {
      props: {
        username: user.username,
        avatar,
        discriminator: user.discriminator,
        spotify: "RoDaBaFilms",
      },
    };
  }
);
