import {
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
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBrandSpotify,
  IconCircleX,
  IconPlus,
  IconX,
} from "@tabler/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";

const useStyles = createStyles((theme) => ({
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
  },

  container: {
    minWidth: 500,
    background: theme.colors.dark[6],
    padding: theme.spacing.xl,
    borderRadius: theme.radius.md,
  },
}));

interface ErrorCardProps {
  icon: JSX.Element;
  title: string | JSX.Element;
  description: string | JSX.Element;
  close?: boolean;
}

export default function ErrorCard({
  icon,
  title,
  description,
  close,
}: ErrorCardProps) {
  const { classes } = useStyles();
  const router = useRouter();

  const theme = useMantineTheme();

  const onButtonClicked = () => {
    if (close) {
      window.close();
      window.location.href = "/";
    } else router.back();
  };

  return (
    <Container className={classes.root}>
      <AnimatePresence>
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <Paper className={classes.container} shadow={"sm"}>
            <Center>
              <motion.div initial={{ rotate: 90 }} animate={{ rotate: 0 }}>
                {icon}
              </motion.div>
            </Center>

            {typeof title === "string" ? (
              <Text align="center" mt="lg" size={24} weight={700}>
                {title}
              </Text>
            ) : (
              title
            )}

            {typeof description === "string" ? (
              <Text color="dimmed" align="center">
                {description}
              </Text>
            ) : (
              description
            )}

            <Button
              fullWidth
              mt="xl"
              leftIcon={close ? <IconX /> : <IconArrowLeft />}
              color="red"
              onClick={onButtonClicked}
            >
              {close ? "Close" : "Back"}
            </Button>
          </Paper>
        </motion.div>
      </AnimatePresence>
    </Container>
  );
}
