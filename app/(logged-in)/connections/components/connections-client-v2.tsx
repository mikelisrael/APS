"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAcceptedConnections,
  usePendingRequests
} from "@/hooks/use-connections";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ConnectionsListV2 from "./connections-list-v2";
import ConnectionsPending from "./connections-pending";
import ConnectionsSuggestions from "./connections-suggestions";

const ConnectionsClientV2 = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get("tab") || "connections";

  const { data: acceptedConnections = [], isLoading: loadingAccepted } =
    useAcceptedConnections();
  const { data: pendingRequests = [], isLoading: loadingPending } =
    usePendingRequests();

  const loading = loadingAccepted || loadingPending;

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <main className="safe-area ~px-2/5">
      <h1 className="page-title !px-0">Connections</h1>

      <div className="mt-10">
        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="pending">
              Pending Requests ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="connections">
              Your Connections ({acceptedConnections.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <ConnectionsPending
              connections={pendingRequests}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="suggestions">
            <ConnectionsSuggestions />
          </TabsContent>

          <TabsContent value="connections">
            <ConnectionsListV2
              connections={acceptedConnections}
              loading={loading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default ConnectionsClientV2;
