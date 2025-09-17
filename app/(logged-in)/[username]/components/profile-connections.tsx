import UserAvatar from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { IoPeopleOutline } from "react-icons/io5";

const ProfileConnections = () => {
  return (
    <Card className="shadow-none">
      <CardHeader className="py-4">
        <h2 className="font-semibold">Network</h2>
      </CardHeader>
      <CardContent>
        <div className="flex-center w-max gap-3">
          <div className="flex -space-x-4">
            <UserAvatar
              src="https://pbs.twimg.com/profile_images/1757743586349629440/Ug9EDUpk_400x400.jpg"
              fallback="MI"
              className="size-14 border-2 border-background shadow-md"
            />
            <UserAvatar
              src="https://pbs.twimg.com/profile_images/1757743586349629440/Ug9EDUpk_400x400.jpg"
              fallback="MI"
              className="size-14 border-2 border-background shadow-md"
            />
            <UserAvatar
              src="https://pbs.twimg.com/profile_images/1757743586349629440/Ug9EDUpk_400x400.jpg"
              fallback="MI"
              className="size-14 border-2 border-background shadow-md"
            />
            <UserAvatar
              src="https://pbs.twimg.com/profile_images/1757743586349629440/Ug9EDUpk_400x400.jpg"
              fallback="MI"
              className="size-14 border-2 border-background shadow-md"
            />
          </div>

          <div className="rounded-full bg-muted p-2 text-sm font-medium">
            +42
          </div>
        </div>

        <Button variant="secondary" className="mt-5 w-full gap-2">
          <IoPeopleOutline size={20} />
          View Connections
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileConnections;
