interface EmptyStateProps {
  message: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <div className="text-center p-12 bg-default-50 rounded-lg border border-default-200 mt-4">
      <p className="text-default-500 text-lg">{message}</p>
    </div>
  );
};
