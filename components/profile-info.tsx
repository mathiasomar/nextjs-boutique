"use client";

import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DataGridSkeleton } from "./loaders/data-grid-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import EditUser from "./edit-user";
import { formatDistance, subDays } from "date-fns";
import ChangePassword from "./change-password";

const ProfileInfo = ({ userId }: { userId: string }) => {
  const { data: user, isLoading } = useUser(userId);
  return (
    <>
      {isLoading ? (
        <DataGridSkeleton items={3} columns={4} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {(user as { name: string | undefined })?.name} profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              <div className="mx-auto col-span-4 md:col-span-1">
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src={(user as { image: string | undefined })?.image}
                    alt={(user as { name: string | undefined })?.name}
                    className="object-cover"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
              <div className="w-max">
                <div className="mb-4">
                  <h1 className="font-semibold py-1 mb-4 border-b">
                    Personal Information
                  </h1>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-2 flex items-center gap-2">
                      <span>Name:</span>{" "}
                      <span>
                        {(user as { name: string | undefined })?.name}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span>Email:</span>{" "}
                      <span>
                        {(user as { email: string | undefined })?.email}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span>Role:</span>{" "}
                      <span>
                        {(
                          user as { role: string | undefined }
                        )?.role?.toLowerCase()}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span>Acccout Created:</span>{" "}
                      <span>
                        {formatDistance(
                          subDays((user as { createdAt: Date }).createdAt, 3),
                          new Date(),
                          {
                            addSuffix: true,
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <ChangePassword />
                  <EditUser userId={userId} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ProfileInfo;
