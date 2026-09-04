import { Spinner } from "@heroui/react";

export const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-48">
      <Spinner size="lg" color="current" />
    </div>
  );
};
