"use client";

import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "./mode-toggle";
import { SidebarTrigger } from "./ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

const Navbar = () => {
  const handleLogout = async () => {
    await authClient.signOut();
    redirect("/");
  };

  const { data: session } = authClient.useSession();
  if (!session) return null;
  return (
    <nav className="p-4 flex items-center justify-between sticky bg-background top-0 z-10">
      {/* LEFT */}
      <SidebarTrigger />
      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <Link href={"/"}>Dashboard</Link>
        {/* THEME TOGGLE */}
        <ModeToggle />
        {/* USER MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={session.user?.image || ""} />
              <AvatarFallback>
                {session.user?.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10}>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/profile/${session?.user.id}`}>
                <User className="h-[1.2rem] w-[1.2rem] mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="h-[1.2rem] w-[1.2rem] mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
