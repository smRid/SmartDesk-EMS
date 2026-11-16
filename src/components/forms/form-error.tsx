export function FormError({ id, message }: { id?: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-sm text-rose-500" id={id} role="alert">
      {message}
    </p>
  );
}
