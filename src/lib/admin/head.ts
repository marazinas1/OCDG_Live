/** Private admin pages must never inherit public social or indexing metadata. */
export function adminHead(title: string) {
  return {
    meta: [
      { title: `${title} | OCDG Admin` },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow, noarchive" },
    ],
  };
}