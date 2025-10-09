import { SuspenseLoader } from "@/components/ui/loaders";
import ConnectionsClientV2 from "./components/connections-client-v2";

export const metadata = {
  title: "Connections",
  description: "Manage your network connections"
};

const ConnectionsPage = () => {
  return (
    <SuspenseLoader>
      <ConnectionsClientV2 />
    </SuspenseLoader>
  );
};

export default ConnectionsPage;
