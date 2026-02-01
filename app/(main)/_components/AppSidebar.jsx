"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { SideBarOptions } from "@/services/Constants";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import Image from "next/image";

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (path) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-col gap-4 px-2 pt-6">
        <Image
          src="/logo.jpeg"
          alt="LastPush"
          width={220}
          height={120}
          className="w-[200px] object-contain"
        />
        <NextLink href="/dashboard/create-interview" className="w-full">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create New Interview
          </Button>
        </NextLink>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {SideBarOptions.map((option, index) => (
              <SidebarMenuItem key={index} className="p-1">
                <SidebarMenuButton asChild isActive={isActive(option.path)}>
                  <NextLink href={option.path}>
                    <option.icon className="size-4 shrink-0" />
                    <span className="text-[15px] font-medium">
                      {option.name}
                    </span>
                  </NextLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
