"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import type { Dict } from "@/lib/i18n";
import type { JwtUser } from "@/lib/server-auth";
import { useLogoutFromDbMutation } from "@/redux/fetchers/auth/authApi";
import { logout } from "@/redux/fetchers/auth/authSlice";
import { useAppDispatch } from "@/redux/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  lang: string;
  t: Dict;
  user: JwtUser;
}

export default function DashboardHeader({ lang, t, user }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [logoutFromDb] = useLogoutFromDbMutation();

  async function handleLogout() {
    await logoutFromDb().unwrap().catch(() => {});
    dispatch(logout());
    router.push(`/${lang}/login`);
    router.refresh();
  }

  const name = user.name ?? user.email;
  const role = user.role === "ADMIN" ? "Admin" : "Sales";
  const roleKey = user.role === "ADMIN" ? "admin" : "sales";

  const base = `/${lang}/dashboard/${roleKey}`;
  const segment = pathname === base ? "" : pathname.slice(base.length).replace(/^\//, "").split("/")[0];
  const title = segment
    ? segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : (user.role === "ADMIN" ? t.dash.overview : t.dash.myDashboard);

  return (
    <header className="dash-header">
      <div className="dash-header__title">
        <h1>{title}</h1>
      </div>
      <div className="dash-header__menu">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="dash-header__trigger" aria-label="Open profile menu">
              <Avatar className="dash-header__avatar">
                <AvatarFallback className="dash-header__avatar-fallback">{name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <ChevronDown size={15} className="dash-header__chevron" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="dmenu-head">
              <Avatar className="dash-header__avatar">
                <AvatarFallback className="dash-header__avatar-fallback">{name[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="dmenu-head-text">
                <p className="dmenu-name">{name}</p>
                <p className="dmenu-email">{user.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t.dash.myAccount}</DropdownMenuLabel>
            <div style={{ padding: "0 10px 6px" }}>
              <Badge variant={roleKey === "admin" ? "default" : "success"}>{role.toUpperCase()}</Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="danger" onClick={handleLogout}>
              <LogOut size={15} aria-hidden="true" />
              <span>{t.dash.logout}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
