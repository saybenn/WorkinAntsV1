import { MeiliSearch } from "meilisearch";
export const meili = new MeiliSearch({
  host: process.env.MEILI_HOST, // e.g. http://127.0.0.1:7700
  apiKey: process.env.MEILI_KEY,
});
