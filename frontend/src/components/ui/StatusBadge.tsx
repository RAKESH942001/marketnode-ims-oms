import { Chip } from "@heroui/react";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  // If it's a positive status, color it Green. Otherwise, Red.
  const isSuccess = status === "CREATED" || status === "IN STOCK";

  return (
    <Chip color={isSuccess ? "success" : "danger"} variant="soft">
      {status}
    </Chip>
  );
};
