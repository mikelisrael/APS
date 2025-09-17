import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const ProfileSkills = () => {
  return (
    <Card className="shadow-none">
      <CardHeader className="flex-row items-center justify-between py-4">
        <h2 className="font-semibold">Skills</h2>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary">React</Badge>
          <Badge variant="primary">TypeScript</Badge>
          <Badge variant="primary">Node.js</Badge>
          <Badge variant="primary">Next.js</Badge>
          <Badge variant="primary">GraphQL</Badge>
          <Badge variant="primary">Docker</Badge>
          <Badge variant="primary">Kubernetes</Badge>
          <Badge variant="primary">AWS</Badge>
          <Badge variant="primary">Figma</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileSkills;
