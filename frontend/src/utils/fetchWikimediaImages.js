export async function fetchWikimediaImages(query, siteName) {
  try {
    let images = [];

    // 1. Try Wikipedia Page API first (highest quality, highly relevant)
    if (siteName) {
      const pageUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=images&titles=${encodeURIComponent(
        siteName
      )}&gimlimit=50&prop=imageinfo&iiprop=url&format=json&origin=*`;

      const pageRes = await fetch(pageUrl);
      const pageData = await pageRes.json();

      if (pageData.query?.pages) {
        images = Object.values(pageData.query.pages)
          .filter(function (page) { return page.imageinfo && page.imageinfo[0]?.url; })
          .map(function (page) { return page.imageinfo[0].url; })
          .filter(function (url) { return /\.(jpg|jpeg|png|webp)$/i.test(url); });
      }
    }

    // 2. Combine with Wikimedia Commons search (using improved exact-match query)
    if (query && images.length < 10) {
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
        query
      )}&gsrlimit=15&prop=imageinfo&iiprop=url&format=json&origin=*&gsrnamespace=6`;

      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      if (searchData.query?.pages) {
        const searchImages = Object.values(searchData.query.pages)
          .filter(function (page) { return page.imageinfo && page.imageinfo[0]?.url; })
          .map(function (page) { return page.imageinfo[0].url; })
          .filter(function (url) { return /\.(jpg|jpeg|png|webp)$/i.test(url); });
          
        images = [...images, ...searchImages];
      }
    }

    return Array.from(new Set(images));

  } catch (err) {
    console.error("Wikimedia fetch failed", err);
    return [];
  }
}