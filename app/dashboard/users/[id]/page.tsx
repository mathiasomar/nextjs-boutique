"use client";

import AppLineChart from "@/components/app-line-chart";
import EditUser from "@/components/edit-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, BadgeCheck, Candy, Citrus, Shield } from "lucide-react";
import { formatDistance, subDays } from "date-fns";
import { useParams } from "next/navigation";
import { UserProfileSkeleton } from "@/components/loaders/user-profile-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useUser } from "@/hooks/use-user";

const SingleUserPage = () => {
  const { id } = useParams();
  // const result = await getuser(id);

  // if (!result) {
  //   notFound();
  // }

  // const user = result;

  const { data: user, isLoading, error } = useUser(id as string);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error as string}</AlertDescription>
      </Alert>
    );
  }
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/users">Users</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                (user as { name: string }).name || "Test User"
              )}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {isLoading ? (
        <UserProfileSkeleton />
      ) : (
        <div className="mt-4 flex flex-col xl:flex-row gap-8">
          {/* LEFT */}
          <div className="w-full xl:w-1/3 space-y-6">
            {/* USER BADGES */}
            <div className="bg-primary-foreground p-4 rounded-lg">
              <h1 className="text-xl font-semibold">User Budges</h1>
              <div className="flex gap-4 mt-4">
                <HoverCard>
                  <HoverCardTrigger>
                    <BadgeCheck
                      size={36}
                      className="rounded-full bg-blue-500/30 border border-blue-500/50 p-2"
                    />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <h1 className="font-bold mb-2">verified user</h1>
                    <p className="text-sm text-muted-foreground">
                      This user has been verified by the admin.
                    </p>
                  </HoverCardContent>
                </HoverCard>
                <HoverCard>
                  <HoverCardTrigger>
                    <Shield
                      size={36}
                      className="rounded-full bg-green-800/30 border border-green-800/50 p-2"
                    />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <h1 className="font-bold mb-2">Admin</h1>
                    <p className="text-sm text-muted-foreground">
                      Admin users have access to all features and can manage
                      users.
                    </p>
                  </HoverCardContent>
                </HoverCard>
                <HoverCard>
                  <HoverCardTrigger>
                    <Candy
                      size={36}
                      className="rounded-full bg-yellow-500/30 borde border-yellow-500/50 p-2"
                    />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <h1 className="font-bold mb-2">Awarded</h1>
                    <p className="text-sm text-muted-foreground">
                      This user has been awarded for their contributions.
                    </p>
                  </HoverCardContent>
                </HoverCard>
                <HoverCard>
                  <HoverCardTrigger>
                    <Citrus
                      size={36}
                      className="rounded-full bg-orange-500/30 border border-orange-500/50 p-2"
                    />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <h1 className="font-bold mb-2">Popular</h1>
                    <p className="text-sm text-muted-foreground">
                      This user has been popular in the community.
                    </p>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
            {/* USER CARD CONTAINER */}
            <div className="bg-primary-foreground p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Avatar className="size-12">
                  <AvatarImage src={(user as { image: string }).image || ""} />
                  <AvatarFallback>
                    {(user as { name: string }).name.charAt(0).toUpperCase() ||
                      "Test User"}
                  </AvatarFallback>
                </Avatar>

                <h1 className="text-xl font-semibold">
                  {(user as { name: string }).name || "Test User"}
                </h1>
              </div>

              <p className="text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Perspiciatis explicabo non quae corrupti dolore minus nihil
                mollitia, assumenda maiores expedita!
              </p>
            </div>
            {/* INFORMATION CONTAINER */}
            <div className="bg-primary-foreground p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">User Information</h1>
                <EditUser userId={(user as { id: string }).id} />
              </div>
              <div className="space-y-4 mt-4">
                <div className="flex flex-col gap-2 mb-8">
                  <p className="text-sm text-muted-foreground">
                    Profile completion
                  </p>
                  <Progress value={66} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Full Name:</span>
                  <span>{(user as { name: string }).name || "Test User"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Email:</span>
                  <span>
                    {(user as { email: string }).email || "someone@gmail.com"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Role:</span>
                  <span>{(user as { role: string }).role || "Test User"}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Joined{" "}
                {formatDistance(
                  subDays((user as { createdAt: Date }).createdAt, 3),
                  new Date(),
                  {
                    addSuffix: true,
                  }
                )}
              </p>
            </div>
          </div>
          {/* RIGHT */}
          <div className="w-full xl:w-2/3 space-y-6">
            {/* THE CHART CONTAINER */}
            <div className="bg-primary-foreground p-4 rounded-lg">
              <h1 className="text-xl font-semibold">User Activity</h1>
              <AppLineChart />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleUserPage;
