import { NextResponse } from 'next/server';
import { getBiosimilarNews } from '@/lib/newsFetcher';

export const revalidate = 300;

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const daysParam = searchParams.get('days');
  const parsedDays = daysParam ? Number.parseInt(daysParam, 10) : NaN;
  const lookback = Number.isFinite(parsedDays) ? parsedDays : 60;
  const boundedLookback = Math.min(Math.max(lookback, 7), 365);

  const data = await getBiosimilarNews(boundedLookback);
  return NextResponse.json(data, {
    headers: {
      'cache-control': 's-maxage=300, stale-while-revalidate=600'
    }
  });
}
