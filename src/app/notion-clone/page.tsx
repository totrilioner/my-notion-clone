import { getNotionPages } from "./actions";
import NotionClientWrapper from "./NotionClientWrapper";

export default async function NotionClonePage() {
  const { pages = [] } = await getNotionPages();
  return <NotionClientWrapper initialPages={pages} />;
}
