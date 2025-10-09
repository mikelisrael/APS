"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserProfile } from "@/types/models";
import { Globe, Mail, Pencil } from "lucide-react";
import Link from "next/link";

interface ProfileAboutProps {
  user: UserProfile;
}

const ProfileAbout: React.FC<ProfileAboutProps> = ({ user }) => {
  const profileData = user.raw_user_meta_data?.profile || {};

  const hasAbout = profileData.about && profileData.about.trim().length > 0;
  const hasEmail = profileData.email && profileData.email.trim().length > 0;
  const hasWebsite =
    profileData.website?.url && profileData.website.url.trim().length > 0;
  const hasAnyContactInfo = hasEmail || hasWebsite;

  return (
    <Card className="shadow-none">
      <CardHeader className="py-4">
        <h2 className="font-semibold">About</h2>
      </CardHeader>

      <CardContent className="space-y-6">
        <section>
          {hasAbout ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {profileData.about}
            </p>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-8">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Pencil size={20} className="text-muted-foreground" />
              </div>
              <p className="mb-1 text-sm font-medium text-foreground">
                No bio available
              </p>
              <p className="mb-4 max-w-[200px] text-center text-xs text-muted-foreground">
                This user hasn&apos;t added any information about themselves yet
              </p>
            </div>
          )}
        </section>

        {hasAnyContactInfo && (
          <section>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              {hasEmail && profileData.email && (
                <Link
                  href={`mailto:${profileData.email}`}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  <Mail size={15} />
                  <span>{profileData.email}</span>
                </Link>
              )}

              {hasWebsite && profileData.website && (
                <Link
                  href={String(profileData.website.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  <Globe size={15} />
                  <span>
                    {profileData.website.title || profileData.website.url}
                  </span>
                </Link>
              )}
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileAbout;
