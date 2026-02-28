import AsyncStorage from '@react-native-async-storage/async-storage';
import { NewsArticle } from '../types';

const CACHE_KEY = '@ully_news_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const FEEDS = [
  { url: 'https://perfectdailygrind.com/feed/', source: 'Perfect Daily Grind' },
  { url: 'https://baristamagazine.com/feed/', source: 'Barista Magazine' },
  { url: 'https://dailycoffeenews.com/feed/', source: 'Roast Magazine' },
];

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function parseItems(xml: string, source: string): NewsArticle[] {
  const items: NewsArticle[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      || block.match(/<title>(.*?)<\/title>/)?.[1]
      || '';
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] || '';
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
    if (title && link) {
      items.push({
        title: decodeHtmlEntities(title.trim()),
        link: link.trim(),
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source,
      });
    }
  }
  return items;
}

async function fetchFeed({ url, source }: { url: string; source: string }): Promise<NewsArticle[]> {
  try {
    const res = await fetch(url);
    const xml = await res.text();
    return parseItems(xml, source);
  } catch {
    return [];
  }
}

export async function getNews(): Promise<NewsArticle[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const { articles, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return articles as NewsArticle[];
      }
    }
  } catch {
    // cache miss, continue to fetch
  }

  const results = await Promise.all(FEEDS.map(fetchFeed));
  const articles = results
    .flat()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  try {
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ articles, timestamp: Date.now() })
    );
  } catch {
    // cache write failure is non-critical
  }

  return articles;
}
