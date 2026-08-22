import { getNotionPages } from "./actions";
import dynamic from "next/dynamic";

const NotionClient = dynamic(() => import("./NotionClient"), {
  ssr: false,
});

export default async function NotionClonePage() {
  const { pages = [] } = await getNotionPages();
  return <NotionClient initialPages={pages} />;
}
