import type { ReactElement } from 'react';
import { NewsDashboard } from '@/components/NewsDashboard';
import { getBiosimilarNews } from '@/lib/newsFetcher';

export const revalidate = 300;

export default async function HomePage(): Promise<ReactElement> {
  const initialResult = await getBiosimilarNews(60);
  return <NewsDashboard initialResult={initialResult} />;
}
