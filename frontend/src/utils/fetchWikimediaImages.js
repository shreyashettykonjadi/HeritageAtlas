export async function fetchWikimediaImages(query) {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query
    )}&gsrlimit=15&prop=imageinfo&iiprop=url&format=json&origin=*&gsrnamespace=6`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.query?.pages) return [];

    return Object.values(data.query.pages)
      .filter(function (page) { return page.imageinfo && page.imageinfo[0]?.url; })
      .map(function (page) { return page.imageinfo[0].url; })
      .filter(function (url) { return /\.(jpg|jpeg|png|webp)$/i.test(url); });

  } catch (err) {
    console.error("Wikimedia fetch failed", err);
    return [];
  }
}