// app/login/page.tsx
import LoginPageClient from './LoginPageClient';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const callbackUrlParam = sp.callbackUrl;
  const callbackUrl =
    typeof callbackUrlParam === 'string' && callbackUrlParam.length > 0
      ? callbackUrlParam
      : '/';

  return <LoginPageClient callbackUrl={callbackUrl} />;
}