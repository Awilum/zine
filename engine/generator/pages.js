export function createPages(publication) {
  let n = 1;
  const pages = [];
  for (const section of publication.sections) {
    for (const spread of section.spreads) {
      for (const side of ['left', 'right']) {
        const data = spread.data?.[side] ?? {};
        pages.push({
          id: `${section.id}-${spread.id}-${side}`,
          chapterId: section.chapter?.id ?? null,
          chapterNumber: section.chapter?.number ?? null,
          chapterTitle: section.chapter?.title ?? null,
          spreadId: spread.id,
          spread: spread.name,
          side,
          pageNumber: n++,
          data,
          layout: data.type,
        });
      }
    }
  }
  return pages;
}
export function assignPageNumbers(pages) {
  return pages.map((p, i) => ({ ...p, pageNumber: i + 1 }));
}
