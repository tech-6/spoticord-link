import { Card, CardHeader } from "@/components/ui/card";
import { XCircleIcon } from "lucide-react";

type ErrorCardProps = {
  title: string;
};

export default function ErrorCard({
  title,
  children,
}: React.PropsWithChildren<ErrorCardProps>) {
  return (
    <Card className="max-w-lg">
      <CardHeader className="flex flex-row items-start gap-4 bg-muted p-4 pb-6">
        <XCircleIcon className="size-12 text-red-500" />

        <div>
          <div className="text-base font-medium md:text-lg">{title}</div>
          <p className="text-xs text-muted-foreground md:text-sm">{children}</p>
        </div>
      </CardHeader>
    </Card>
  );
}
