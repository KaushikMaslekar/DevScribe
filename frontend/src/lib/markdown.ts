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

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown) as string;
}

export function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html).trim();
}
