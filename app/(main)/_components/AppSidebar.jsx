"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SideBarOptions } from "@/services/Constants";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import Image from "next/image";

export function AppSidebar() {
  const path = usePathname();
  console.log(path);

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center mt-5">
        <Image
          src="/logo.jpeg"
          alt="logo"
          width={220}
          height={120}
          className="w-[200px]"
        />

        <Button className="w-full mt-5">
          <Plus /> Create New Interview
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {SideBarOptions.map((option, index) => (
            <SidebarMenuItem key={index} className="p-1">
              <SidebarMenuButton
                asChild
                className={`p-5 ${path == option.path && "bg-blue-50"}`}
              >
                <NextLink href={option.path}>
                  <option.icon
                    className={`${path == option.path && "text-primary"}`}
                  />

                  <span
                    className={`text-[16px] font-medium ${path == option.path && "text-primary"}`}
                  >
                    {option.name}
                  </span>
                </NextLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter />
    </Sidebar>
  );
}
