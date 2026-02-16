export function resolveUrlString(host: string, path: string): string {
  let trimmedHost = host.trim();
  let trimmedPath = path.trim();

  while (trimmedHost.endsWith('/') || trimmedHost.endsWith('\\')) {
    trimmedHost = trimmedHost.slice(0, -1);
  }
  while (trimmedPath.startsWith('/') || trimmedPath.startsWith('\\')) {
    trimmedPath = trimmedPath.slice(1);
  }
  return `${trimmedHost}/${trimmedPath}`;
}
