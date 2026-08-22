import { getNotionPages } from "./actions";
import NotionClient from "./NotionClient";

export default async function NotionClonePage() {
  const { pages = [] } = await getNotionPages();
  return <NotionClient initialPages={pages} />;
}
