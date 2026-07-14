export interface MediaItem {
  id: string;
  outlet: string;
  title: string;
  url: string;
  logo?: string;
  verified: boolean;
}

// TODO: replace with verified media mentions — добавить реальные ссылки на публикации
export const media: MediaItem[] = [
  {
    id: "forbes",
    outlet: "Forbes Kazakhstan",
    title: "TODO: добавить заголовок публикации",
    url: "#",
    verified: false,
  },
  {
    id: "tengri",
    outlet: "Tengrinews",
    title: "TODO: добавить заголовок публикации",
    url: "#",
    verified: false,
  },
  {
    id: "zakon",
    outlet: "Zakon.kz",
    title: "TODO: добавить заголовок публикации",
    url: "#",
    verified: false,
  },
];
