import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hash, Loader2, LogIn, LogOut, Settings } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { PageType } from "../App";
import AppHeader from "../components/AppHeader";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useIsAdmin,
  useSaveProfile,
  useUserProfile,
} from "../hooks/useQueries";
import { principalToCode } from "../utils/memberCode";

interface ProfilePageProps {
  onNavigate: (page: PageType) => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { identity, login, clear } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: profile } = useUserProfile();
  const { data: isAdmin } = useIsAdmin();
  const { mutateAsync: saveProfile, isPending } = useSaveProfile();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);

  const principal = identity?.getPrincipal().toString() ?? "";
  const memberCode = principal ? principalToCode(principal) : "";
  const initials = profile?.name
    ? profile.name.slice(0, 2).toUpperCase()
    : principal.slice(0, 2).toUpperCase() || "GU";

  const handleSave = async () => {
    try {
      await saveProfile({ name: name.trim() || "User" });
      toast.success("প্রোফাইল সেভ হয়েছে ✅");
      setEditing(false);
    } catch {
      toast.error("সেভ করতে সমস্যা হয়েছে");
    }
  };

  if (!isLoggedIn) {
    return (
      <div data-ocid="profile.page">
        <AppHeader />
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mb-5">
            <LogIn size={36} className="text-orange-400" />
          </div>
          <h2 className="font-bold text-gray-800 text-lg mb-2">
            প্রোফাইল দেখতে Login করুন
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            আপনার অ্যাকাউন্ট ম্যানেজ করতে পারবেন
          </p>
          <Button
            data-ocid="profile.login.button"
            onClick={login}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-2 rounded-full"
          >
            Login করুন
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-ocid="profile.page">
      <AppHeader />
      <div className="px-4 py-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-100"
        >
          <Avatar className="w-16 h-16 border-3 border-orange-300">
            <AvatarFallback className="bg-orange-500 text-white text-xl font-black">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 text-lg">
              {profile?.name ?? "User"}
            </p>
            {isAdmin && (
              <span className="inline-block mt-1 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </div>
        </motion.div>

        {/* Member Code Card */}
        {memberCode && (
          <div className="bg-white rounded-xl border border-orange-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Hash size={15} className="text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">আপনার মেম্বার কোড</p>
                <p className="font-mono font-black text-orange-600 text-xl tracking-widest">
                  {memberCode}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-gray-400 bg-gray-100 rounded px-2 py-1">
              ইউনিক কোড
            </span>
          </div>
        )}

        {editing ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
            <Label className="text-sm font-semibold text-gray-700">
              আপনার নাম
            </Label>
            <Input
              data-ocid="profile.input"
              placeholder="নাম লিখুন"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                data-ocid="profile.cancel_button"
                variant="outline"
                onClick={() => setEditing(false)}
                className="flex-1"
              >
                বাতিল
              </Button>
              <Button
                data-ocid="profile.save_button"
                onClick={handleSave}
                disabled={isPending}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold"
              >
                {isPending && (
                  <Loader2 size={14} className="animate-spin mr-1" />
                )}
                সেভ করুন
              </Button>
            </div>
          </div>
        ) : (
          <Button
            data-ocid="profile.edit_button"
            variant="outline"
            onClick={() => {
              setName(profile?.name ?? "");
              setEditing(true);
            }}
            className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
          >
            প্রোফাইল এডিট করুন
          </Button>
        )}

        {isAdmin && (
          <Button
            data-ocid="profile.admin.button"
            onClick={() => onNavigate("admin")}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold flex items-center gap-2"
          >
            <Settings size={16} />
            Admin Panel
          </Button>
        )}

        <Button
          data-ocid="profile.logout.button"
          variant="outline"
          onClick={clear}
          className="w-full border-red-200 text-red-500 hover:bg-red-50 font-semibold flex items-center gap-2"
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </div>
  );
}
