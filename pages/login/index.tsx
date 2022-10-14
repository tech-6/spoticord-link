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
import { IconInfoCircle, IconBrandDiscord } from "@tabler/icons";
import { motion } from "framer-motion";

import logo from "@images/logo.webp";
import { withSessionSsr } from "@lib/withSession";
import { useRouter } from "next/router";
import { loginRequest } from "@lib/config";

import * as database from "@lib/database";
import { pseudoRandomBytes, randomBytes } from "crypto";

const useStyles = createStyles((theme) => ({
  root: {
    height: "100vh",
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
}));

const SCOPES: [string, string, any][] = [
  [
    "identify",
    "Access basic profile information",
    <>
      <Text>Your username, avatar, banner, etc.</Text>
      <Text color="dimmed" size="sm">
        This permission allows Spoticord to retrieve basic information about
        your account, such as your username and avatar.
      </Text>
      <Text color="dimmed" size="sm" mt="md">
        This permission <strong>does not</strong> allow Spoticord to access your
        email address, payment info, or any other sensitive information.
      </Text>
    </>,
  ],
];

interface LoginPageProps {
  url: string;
}

export default function LoginPage({ url }: LoginPageProps) {
  const { classes, cx } = useStyles();

  const theme = useMantineTheme();
  const router = useRouter();

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
                <Avatar src={logo.src} radius={1000000} size="xl" />
              </Center>

              <Text align="center" mt="xl" size={24} weight={700}>
                Spotify Accounts
              </Text>

              <Text color="dimmed" align="center">
                To be able to use Spoticord Accounts, you must first log in with
                your Discord account.
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
                icon={<IconInfoCircle />}
                title="Note"
                color="indigo"
              >
                Logging in with your Discord account will automatically link
                your Discord account with Spoticord
              </Alert>

              <Button
                component="a"
                href={url}
                leftIcon={<IconBrandDiscord />}
                color="indigo"
                fullWidth
                size="lg"
              >
                Log in with Discord
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
}

// Path: pages/spotify/[token].tsx
export const getServerSideProps = withSessionSsr(async ({ req }) => {
  if (req.session.user_id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  req.session.csrf_token = randomBytes(32).toString("hex");

  const info = await database.getDiscordAppInfo();

  const params = new URLSearchParams();
  params.set("client_id", info.client_id);
  params.set("redirect_uri", process.env.DISCORD_REDIRECT_URI!);
  params.set("response_type", "code");
  params.set("scope", encodeURIComponent(`${loginRequest.scopes.join(" ")}`));
  params.set("state", req.session.csrf_token);

  await req.session.save();

  return {
    props: {
      url: `https://discord.com/oauth2/authorize?${params.toString()}`,
    },
  };
});
