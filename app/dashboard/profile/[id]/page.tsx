"use client";

import { UserProfileSkeleton } from "@/components/loaders/user-profile-skeleton";
import ProfileImageUpload from "@/components/profile-image-upload";
import ProfileInfo from "@/components/profile-info";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/generated/prisma/client";
import { useUser } from "@/hooks/use-user";
import { useParams } from "next/navigation";

const ProfilePage = () => {
  const { id } = useParams();
  const { data, isLoading } = useUser(id as string);
  return (
    <div>
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {isLoading ? (
                <Skeleton className="w-6 h-4" />
              ) : (
                (data as { name: string }).name
              )}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div>
        {isLoading ? (
          <UserProfileSkeleton />
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {/* Image Upload */}
            <div className="col-span-4 md:col-span-1">
              <ProfileImageUpload user={data as User} />
            </div>
            {/* Info Grid */}
            <div className="col-span-4 md:col-span-3">
              <ProfileInfo userId={id as string} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
