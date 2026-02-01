export function sortMatches(matches) {
  return matches.sort((a, b) => {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    return a.line - b.line;
  });
}
