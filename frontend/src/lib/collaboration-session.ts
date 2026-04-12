export function hasCollaborationTransport(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_HOCUSPOCUS_URL);
}
