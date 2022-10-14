import { Alert, Button, Group, MantineColor, Modal, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons";

interface ConfirmProps {
  title: string;
  description: string;

  alert?: string;
  color?: MantineColor;
  icon?: React.ReactNode;

  invertColors?: boolean;

  opened: boolean;
  onClose: (confirmed: boolean) => void;
}

export default function Confirm({
  title,
  description,
  color,
  icon,
  alert,
  invertColors,
  opened,
  onClose,
}: ConfirmProps) {
  return (
    <Modal
      centered
      opened={opened}
      onClose={() => onClose(false)}
      title={title}
      size="lg"
    >
      <Text weight={600} mb={alert ? "xs" : "xl"}>
        {description}
      </Text>

      {alert && (
        <Alert
          color={color ?? "teal"}
          icon={icon || <IconAlertTriangle />}
          mb="xl"
        >
          {alert}
        </Alert>
      )}

      <Group position="right" spacing={8}>
        <Button
          color={invertColors ? "teal" : "red"}
          onClick={() => onClose(false)}
        >
          Cancel
        </Button>
        <Button
          color={invertColors ? "red" : "teal"}
          onClick={() => onClose(true)}
        >
          Confirm
        </Button>
      </Group>
    </Modal>
  );
}
