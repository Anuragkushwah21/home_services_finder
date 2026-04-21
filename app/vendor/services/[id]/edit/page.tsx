// app/vendor/services/[id]/edit/page.tsx

import EditServiceClient from './EditServiceClient';

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditServiceClient id={id} />;
}