export function FormError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-rose-500">{message}</p>;
}
