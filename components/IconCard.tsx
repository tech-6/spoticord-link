import {
  Box,
  Button,
  Center,
  Container,
  createStyles,
  DefaultMantineColor,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { IconArrowLeft, IconX } from "@tabler/icons";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

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
    },
  },

  wrapper: {
    [theme.fn.smallerThan("xs")]: {
      width: "100%",
      minHeight: "100%",
    },
  },

  container: {
    minWidth: 500,
    background: theme.colors.dark[6],
    padding: theme.spacing.xl,
    borderRadius: theme.radius.md,

    [theme.fn.smallerThan("xs")]: {
      minWidth: 0,
      margin: 0,
      width: "100vw",
      height: "100%",
      borderRadius: 0,
    },
  },
}));

interface ErrorCardProps {
  icon: JSX.Element;
  title: string | JSX.Element;
  description: string | JSX.Element;
  close?: boolean;
  closeColor?: DefaultMantineColor;
}

export default function ErrorCard({
  icon,
  title,
  description,
  close,
  closeColor,
}: ErrorCardProps) {
  const { classes } = useStyles();
  const router = useRouter();

  const onButtonClicked = () => {
    if (close) {
      window.close();
      router.push("/");
    } else router.back();
  };

  return (
    <Container className={classes.root}>
      <motion.div
        className={classes.wrapper}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <Paper className={classes.container} shadow={"sm"}>
          <Stack sx={{ height: "100%" }} justify="space-between">
            <Box>
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
            </Box>

            <Button
              mt="xl"
              fullWidth
              leftIcon={close ? <IconX /> : <IconArrowLeft />}
              color={closeColor || "red"}
              onClick={onButtonClicked}
              styles={{ leftIcon: { marginRight: 4 } }}
            >
              {close ? "Close" : "Back"}
            </Button>
          </Stack>
        </Paper>
      </motion.div>
    </Container>
  );
}
