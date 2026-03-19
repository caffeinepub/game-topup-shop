import type { Principal } from "@icp-sdk/core/principal";
import {
  AlertCircle,
  Hash,
  Loader2,
  RefreshCw,
  Shield,
  ShieldCheck,
  ShieldOff,
  ShieldPlus,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminLevel } from "../../backend.d";
import { useActor } from "../../hooks/useActor";
import { useSetSubAdmin, useSetSuperAdminRole } from "../../hooks/useQueries";
import { principalToCode } from "../../utils/memberCode";

interface MemberInfo {
  principal: Principal;
  adminLevel: AdminLevel;
  name: string;
}

type GetAllMembersActor = {
  getAllMembers(): Promise<
    Array<{
      principal: Principal;
      profile: { name: string } | null;
      adminLevel: AdminLevel;
    }>
  >;
};

export default function MembersTab() {
  const { actor, isFetching } = useActor();
  const { mutateAsync: setSubAdmin } = useSetSubAdmin();
  const { mutateAsync: setSuperAdminRole } = useSetSuperAdminRole();
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadMembers = () => {
    if (!actor || isFetching) return;
    setLoading(true);
    setError(false);
    (actor as unknown as GetAllMembersActor)
      .getAllMembers()
      .then((list) => {
        setMembers(
          list.map((m) => ({
            principal: m.principal,
            adminLevel: m.adminLevel,
            name: m.profile?.name ?? "",
          })),
        );
      })
      .catch(() => {
        setError(true);
        toast.error("মেম্বার লোড ব্যর্থ");
      })
      .finally(() => setLoading(false));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey triggers manual reload
  useEffect(() => {
    if (!actor || isFetching) return;
    loadMembers();
  }, [actor, isFetching, refreshKey]);

  type RoleAction = "superAdmin" | "subAdmin" | "demote";

  const handleSetRole = async (member: MemberInfo, action: RoleAction) => {
    const pid = member.principal.toString();
    setToggling(`${pid}-${action}`);
    try {
      if (action === "superAdmin") {
        await setSuperAdminRole({ user: member.principal, enable: true });
        setMembers((prev) =>
          prev.map((m) =>
            m.principal.toString() === pid
              ? { ...m, adminLevel: AdminLevel.superAdmin }
              : m,
          ),
        );
        toast.success("সুপার অ্যাডমিন বানানো হয়েছে");
      } else if (action === "subAdmin") {
        await setSubAdmin({ user: member.principal, enable: true });
        setMembers((prev) =>
          prev.map((m) =>
            m.principal.toString() === pid
              ? { ...m, adminLevel: AdminLevel.subAdmin }
              : m,
          ),
        );
        toast.success("সাব-অ্যাডমিন বানানো হয়েছে");
      } else {
        if (member.adminLevel === AdminLevel.subAdmin) {
          await setSubAdmin({ user: member.principal, enable: false });
        } else {
          await setSuperAdminRole({ user: member.principal, enable: false });
        }
        setMembers((prev) =>
          prev.map((m) =>
            m.principal.toString() === pid
              ? { ...m, adminLevel: AdminLevel.none }
              : m,
          ),
        );
        toast.success("রোল সরানো হয়েছে");
      }
    } catch {
      toast.error("ব্যর্থ হয়েছে");
    }
    setToggling(null);
  };

  if (loading) {
    return (
      <div
        data-ocid="admin.members.loading_state"
        className="text-center py-12"
      >
        <Loader2
          size={28}
          className="animate-spin text-orange-500 mx-auto mb-2"
        />
        <p className="text-gray-500 text-sm">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div data-ocid="admin.members.error_state" className="text-center py-12">
        <div className="w-14 h-14 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle size={24} className="text-red-400" />
        </div>
        <p className="text-gray-300 font-semibold mb-1">মেম্বার লোড হয়নি</p>
        <p className="text-gray-500 text-sm mb-5">
          সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।
        </p>
        <button
          type="button"
          data-ocid="admin.members.retry.button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-orange-400" />
          <span className="text-sm font-semibold text-gray-300">
            {members.length} মেম্বার
          </span>
        </div>
        <button
          type="button"
          data-ocid="admin.members.refresh.button"
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-800"
        >
          <RefreshCw size={12} />
          রিফ্রেশ
        </button>
      </div>

      {members.length === 0 && (
        <div
          data-ocid="admin.members.empty_state"
          className="text-center py-12 text-gray-500"
        >
          <Users size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">কোনো মেম্বার নেই</p>
        </div>
      )}

      {members.map((member, i) => {
        const pid = member.principal.toString();
        const code = principalToCode(pid);
        const isSuperAdmin = member.adminLevel === AdminLevel.superAdmin;
        const isSubAdmin = member.adminLevel === AdminLevel.subAdmin;
        const isUser = !isSuperAdmin && !isSubAdmin;
        const isTogglingAny = toggling?.startsWith(pid);

        return (
          <div
            key={pid}
            data-ocid={`admin.member.item.${i + 1}`}
            className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            {/* Member info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shrink-0">
                <User size={16} className="text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-orange-400">
                    <Hash size={10} />#{code}
                  </span>
                  {isSuperAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                      <ShieldCheck size={10} /> সুপার অ্যাডমিন
                    </span>
                  )}
                  {isSubAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                      <Shield size={10} /> সাব-অ্যাডমিন
                    </span>
                  )}
                  {isUser && (
                    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-700 text-gray-400">
                      <User size={10} /> সাধারণ ইউজার
                    </span>
                  )}
                </div>
                {member.name && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {member.name}
                  </p>
                )}
              </div>
            </div>

            {/* Role action buttons */}
            {!isSuperAdmin && (
              <div className="flex flex-wrap gap-1.5 shrink-0">
                {/* Promote to Super Admin */}
                <button
                  type="button"
                  data-ocid={`admin.member.toggle.${i + 1}`}
                  onClick={() => handleSetRole(member, "superAdmin")}
                  disabled={!!isTogglingAny}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 disabled:opacity-50"
                >
                  {toggling === `${pid}-superAdmin` ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <ShieldPlus size={11} />
                  )}
                  সুপার অ্যাডমিন
                </button>

                {/* Promote to Sub-Admin (only if currently user/super admin) */}
                {!isSubAdmin && (
                  <button
                    type="button"
                    onClick={() => handleSetRole(member, "subAdmin")}
                    disabled={!!isTogglingAny}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50"
                  >
                    {toggling === `${pid}-subAdmin` ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <Shield size={11} />
                    )}
                    সাব-অ্যাডমিন
                  </button>
                )}

                {/* Demote to user (only if sub-admin) */}
                {isSubAdmin && (
                  <button
                    type="button"
                    onClick={() => handleSetRole(member, "demote")}
                    disabled={!!isTogglingAny}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {toggling === `${pid}-demote` ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : (
                      <ShieldOff size={11} />
                    )}
                    সরান
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
