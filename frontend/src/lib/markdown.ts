import { marked } from "marked";
import TurndownService from "turndown";

marked.setOptions({
  breaks: true,
  gfm: true,
});

const turndownService = new TurndownService({
  codeBlockStyle: "fenced",
  emDelimiter: "_",
  headingStyle: "atx",
  bulletListMarker: "-",
});

const MAX_CACHE_ENTRIES = 200;
const markdownToHtmlCache = new Map<string, string>();
const htmlToMarkdownCache = new Map<string, string>();

function cacheGet(cache: Map<string, string>, key: string): string | undefined {
  const value = cache.get(key);
  if (value === undefined) {
    return undefined;
  }

  // Refresh insertion order for a simple LRU behavior.
  cache.delete(key);
  cache.set(key, value);
  return value;
}

function cacheSet(
  cache: Map<string, string>,
  key: string,
  value: string,
): void {
  cache.set(key, value);
  if (cache.size <= MAX_CACHE_ENTRIES) {
    return;
  }

  const oldestKey = cache.keys().next().value;
  if (oldestKey !== undefined) {
    cache.delete(oldestKey);
  }
}

export function markdownToHtml(markdown: string): string {
  const cached = cacheGet(markdownToHtmlCache, markdown);
  if (cached !== undefined) {
    return cached;
  }

  const html = marked.parse(markdown) as string;
  cacheSet(markdownToHtmlCache, markdown, html);
  return html;
}

export function htmlToMarkdown(html: string): string {
  const cached = cacheGet(htmlToMarkdownCache, html);
  if (cached !== undefined) {
    return cached;
  }

  const markdown = turndownService.turndown(html).trim();
  cacheSet(htmlToMarkdownCache, html, markdown);
  return markdown;
}
