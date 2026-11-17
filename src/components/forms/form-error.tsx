export function FormError({ id, message }: { id?: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-sm font-medium text-rose-700 dark:text-rose-300" id={id} role="alert">
      {message}
    </p>
  );
}
