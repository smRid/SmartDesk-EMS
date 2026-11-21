"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body><main style={{ margin: "4rem auto", maxWidth: 640, padding: "1.5rem" }}>
    <h1>SmartDesk EMS is temporarily unavailable</h1>
    <p>Please retry. If the problem continues, contact your administrator.</p>
    <button onClick={reset} type="button">Try again</button>
  </main></body></html>;
}
