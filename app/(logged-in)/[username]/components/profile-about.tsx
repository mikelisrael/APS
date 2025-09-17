import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { FaRegEnvelope } from "react-icons/fa";
import { TbWorld } from "react-icons/tb";

const ProfileAbout = () => {
  return (
    <>
      <Card className="shadow-none">
        <CardHeader className="flex-row items-center justify-between py-4">
          <h2 className="font-semibold">About</h2>
        </CardHeader>

        <CardContent className="text-sm text-muted-foreground">
          <p>
            Passionate software engineer with expertise in React, TypeScript,
            and Node.js working with 7+ years of experience building scalable
            web applications.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href="mailto:israelipinkz@gmail.com"
              className="flex items-center gap-1.5 underline-offset-4 hover:underline"
            >
              <FaRegEnvelope size={15} />
              <span>israelipinkz@gmail.com</span>
            </Link>

            <Link
              href="https://mikelisrael.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 underline-offset-4 hover:underline"
            >
              <TbWorld size={20} />
              <span>Website Porfolio</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ProfileAbout;
