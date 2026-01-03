import React, { useState } from 'react';
import { Home, Phone, Users, ChevronRight, Settings, Menu, X, LogOut, User, CreditCard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const navigationItems = [
  { name: 'Dashboard', icon: Home, href: '/dashboard' },
  { name: 'Calls', icon: Phone, href: '/calls' },
  { name: 'Clients', icon: Users, href: '/clients' },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const DashboardSidebar = ({ collapsed, onToggle }: DashboardSidebarProps) => {
  const location = useLocation();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Header */}
        <div className={cn("p-6 flex items-center justify-between")}>
          {!collapsed ? (
            <>
              <Link to="/" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                  <img
                    src="/DYOTA_logo-removebg-preview.png"
                    alt="Logo"
                    className="w-6 h-6 object-contain brightness-0 invert"
                  />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">
                  Voice Bolt
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="w-8 h-8 p-0 hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 rotate-180" />
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
                <img
                  src="/DYOTA_logo-removebg-preview.png"
                  alt="Logo"
                  className="w-6 h-6 object-contain brightness-0 invert"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="w-8 h-8 p-0 hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-2">
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Main Menu
              </p>
            )}
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    collapsed ? 'justify-center' : 'justify-between'
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <div className="flex items-center">
                    <item.icon className={cn(
                      'h-[18px] w-[18px]',
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600',
                      collapsed ? '' : 'mr-3'
                    )} />
                    {!collapsed && item.name}
                  </div>
                  {!collapsed && isActive && (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Link>
              );
            })}
          </div>
        </ScrollArea>

        {/* User Profile */}
        <div className={cn("p-4 border-t border-gray-100", collapsed ? "px-2" : "")}>
          <div
            className={cn(
              "flex items-center rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group",
              collapsed ? "justify-center p-2" : "p-2"
            )}
            onClick={() => setProfileDialogOpen(true)}
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">
              JD
            </div>
            {!collapsed && (
              <>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">John Doe</p>
                  <p className="text-[10px] text-gray-500 truncate">Free Plan</p>
                </div>
                <Settings className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* User Profile Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
            <DialogDescription>
              Manage your account settings and preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-2xl">
                JD
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">John Doe</h3>
                <p className="text-sm text-gray-600">john.doe@email.com</p>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Free Plan
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setProfileDialogOpen(false);
                  // Navigate to profile
                }}
              >
                <User className="h-4 w-4 mr-3" />
                My Profile
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setProfileDialogOpen(false);
                  // Navigate to billing
                }}
              >
                <CreditCard className="h-4 w-4 mr-3" />
                Billing & Plans
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setProfileDialogOpen(false);
                  // Navigate to settings
                }}
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </Button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Sign Out */}
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                setProfileDialogOpen(false);
                // Handle sign out
              }}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardSidebar;
