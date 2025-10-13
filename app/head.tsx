// ADMIN: /app/head.tsx  (explicit noindex; canonical to admin)
export default function Head() {
  return (
    <>
      <link rel="canonical" href="https://admin.rentback.app/" />
      <meta name="robots" content="noindex,nofollow" />
      <meta name="theme-color" content="#059669" />
    </>
  );
}
