// app/verify-otp/page.tsx
import VerifyOTPClient from './VerifyOTPClient';

export default async function VerifyOTPPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const emailParam = sp.email;
  const email =
    typeof emailParam === 'string' && emailParam.length > 0
      ? emailParam
      : '';

  return <VerifyOTPClient email={email} />;
}