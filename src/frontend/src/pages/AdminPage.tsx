import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@icp-sdk/core/principal";
import {
  CheckCircle2,
  Clock,
  Edit3,
  Hash,
  ImageIcon,
  Loader2,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShieldOff,
  Trash2,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminLevel, OrderStatus, RequestStatus, UserRole } from "../backend.d";
import type { BannerInput, Product, ProductInput } from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  useAddBanner,
  useAddProduct,
  useAllOrders,
  useAllRechargeRequests,
  useApproveRechargeRequest,
  useCreditWallet,
  useDeleteBanner,
  useDeleteProduct,
  useGetBanners,
  useGetPaymentSettings,
  useGetSiteSettings,
  useInitializeSampleData,
  useMyAdminLevel,
  useProducts,
  useRejectRechargeRequest,
  useSetAnnouncement,
  useSetPaymentSettings,
  useSetSiteSettings,
  useSetSubAdmin,
  useUpdateBanner,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";
import { principalToCode } from "../utils/memberCode";

const emptyProduct: ProductInput = {
  name: "",
  description: "",
  price: BigInt(0),
  imageUrl: "",
  category: "free-fire",
  isFeatured: false,
  isActive: true,
};

const emptyBanner: BannerInput = {
  title: "",
  description: "",
  imageUrl: "",
  isActive: true,
};

function formatDate(nanoseconds: bigint) {
  const ms = Number(nanoseconds / BigInt(1_000_000));
  return new Date(ms).toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
  });
}

const statusOptions = [
  { value: OrderStatus.pending, label: "Pending" },
  { value: OrderStatus.processing, label: "Processing" },
  { value: OrderStatus.completed, label: "Completed" },
  { value: OrderStatus.cancelled, label: "Cancelled" },
];

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "bg-yellow-100 text-yellow-700",
  [OrderStatus.processing]: "bg-blue-100 text-blue-700",
  [OrderStatus.completed]: "bg-green-100 text-green-700",
  [OrderStatus.cancelled]: "bg-red-100 text-red-700",
};

const METHOD_LABEL: Record<string, string> = {
  bkash: "বিকাশ",
  nagad: "নগদ",
  rocket: "রকেট",
};

function RechargeStatusBadge({ status }: { status: RequestStatus }) {
  if (status === RequestStatus.pending) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
        <Clock size={11} /> অপেক্ষামান
      </span>
    );
  }
  if (status === RequestStatus.approved) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        <CheckCircle2 size={11} /> অনুমোদিত
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
      <XCircle size={11} /> বাতিল
    </span>
  );
}

function MemberCodeBadge({ principalId }: { principalId: string }) {
  const code = principalToCode(principalId);
  return (
    <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 font-mono font-bold text-xs px-2 py-0.5 rounded-full">
      <Hash size={10} />
      {code}
    </span>
  );
}

function AdminLevelBadge({ level }: { level: AdminLevel }) {
  if (level === AdminLevel.superAdmin) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
        <ShieldCheck size={11} /> সুপার অ্যাডমিন
      </span>
    );
  }
  if (level === AdminLevel.subAdmin) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
        <ShieldCheck size={11} /> সাব-অ্যাডমিন
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
      <User size={11} /> সাধারণ ইউজার
    </span>
  );
}

interface MembersListTabProps {
  orders: import("../backend.d").OrderWithProduct[] | undefined;
  rechargeRequests: import("../backend.d").Request[] | undefined;
  setSubAdmin: (args: {
    user: import("@icp-sdk/core/principal").Principal;
    enable: boolean;
  }) => Promise<unknown>;
}

function MembersListTab({
  orders,
  rechargeRequests,
  setSubAdmin,
}: MembersListTabProps) {
  const { actor } = useActor();
  const [memberInfos, setMemberInfos] = useState<
    {
      principal: import("@icp-sdk/core/principal").Principal;
      adminLevel: AdminLevel;
      name: string | null;
      loading: boolean;
    }[]
  >([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!actor || initialized) return;
    const uniquePrincipals = new Map<
      string,
      import("@icp-sdk/core/principal").Principal
    >();
    for (const o of orders ?? [])
      uniquePrincipals.set(o.userId.toString(), o.userId);
    for (const r of rechargeRequests ?? [])
      uniquePrincipals.set(r.user.toString(), r.user);
    if (uniquePrincipals.size === 0) {
      setInitialized(true);
      return;
    }
    const entries = Array.from(uniquePrincipals.values());
    setMemberInfos(
      entries.map((p) => ({
        principal: p,
        adminLevel: AdminLevel.none,
        name: null,
        loading: true,
      })),
    );
    setInitialized(true);
    Promise.all(
      entries.map(async (p, i) => {
        const [level, profile] = await Promise.all([
          actor.getUserAdminLevel(p),
          actor.getUserProfile(p),
        ]);
        return { index: i, level, name: profile?.name ?? null };
      }),
    ).then((results) => {
      setMemberInfos((prev) => {
        const next = [...prev];
        for (const r of results) {
          if (next[r.index]) {
            next[r.index] = {
              ...next[r.index],
              adminLevel: r.level,
              name: r.name,
              loading: false,
            };
          }
        }
        return next;
      });
    });
  }, [actor, orders, rechargeRequests, initialized]);

  const handleToggle = async (idx: number, enable: boolean) => {
    const member = memberInfos[idx];
    if (!member) return;
    try {
      await setSubAdmin({ user: member.principal, enable });
      setMemberInfos((prev) => {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          adminLevel: enable ? AdminLevel.subAdmin : AdminLevel.none,
        };
        return next;
      });
      toast.success(enable ? "সাব-অ্যাডমিন করা হয়েছে" : "সাব-অ্যাডমিন সরানো হয়েছে");
    } catch {
      toast.error("ব্যর্থ হয়েছে");
    }
  };

  if (
    !initialized ||
    (memberInfos.length > 0 && memberInfos.every((m) => m.loading))
  ) {
    return (
      <div
        data-ocid="admin.members.loading_state"
        className="flex items-center justify-center py-12"
      >
        <Loader2 size={24} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (memberInfos.length === 0) {
    return (
      <div
        data-ocid="admin.members.empty_state"
        className="bg-white rounded-xl border border-gray-100 p-8 text-center"
      >
        <Users size={32} className="text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">কোনো মেম্বার নেই</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-orange-50">
            <TableHead className="text-xs font-semibold text-gray-700 w-20">
              কোড
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-700">
              নাম
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-700">
              রোল
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-700 text-right">
              অ্যাকশন
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {memberInfos.map((member, idx) => {
            const code = principalToCode(member.principal.toString());
            const isSuperAdminMember =
              member.adminLevel === AdminLevel.superAdmin;
            const isSubAdminMember = member.adminLevel === AdminLevel.subAdmin;
            return (
              <TableRow
                key={member.principal.toString()}
                data-ocid={`admin.members.item.${idx + 1}`}
                className="hover:bg-gray-50"
              >
                <TableCell>
                  {member.loading ? (
                    <Loader2 size={12} className="animate-spin text-gray-400" />
                  ) : (
                    <span className="font-mono font-bold text-orange-600 text-sm tracking-widest">
                      #{code}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-gray-700">
                  {member.loading ? "..." : member.name || "নাম নেই"}
                </TableCell>
                <TableCell>
                  {!member.loading && (
                    <AdminLevelBadge level={member.adminLevel} />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isSuperAdminMember ? (
                    <span className="text-[11px] text-purple-600 font-semibold">
                      সুপার অ্যাডমিন
                    </span>
                  ) : isSubAdminMember ? (
                    <Button
                      data-ocid={`admin.members.delete_button.${idx + 1}`}
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleToggle(idx, false)}
                    >
                      সরান
                    </Button>
                  ) : (
                    <Button
                      data-ocid={`admin.members.edit_button.${idx + 1}`}
                      size="sm"
                      className="text-xs h-7 bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => handleToggle(idx, true)}
                      disabled={member.loading}
                    >
                      <ShieldCheck size={11} className="mr-1" />
                      সাব-অ্যাডমিন
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdminPage() {
  const { data: myAdminLevel } = useMyAdminLevel();
  const isSuperAdmin = myAdminLevel === AdminLevel.superAdmin;

  const { data: products } = useProducts();
  const { data: orders } = useAllOrders();
  const { data: rechargeRequests } = useAllRechargeRequests();
  const { data: siteSettings } = useGetSiteSettings();
  const { data: paymentSettings } = useGetPaymentSettings();
  const { data: banners } = useGetBanners();

  const { mutateAsync: addProduct, isPending: addingProduct } = useAddProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const { mutateAsync: deleteProduct } = useDeleteProduct();
  const { mutateAsync: updateStatus } = useUpdateOrderStatus();
  const { mutateAsync: setAnnouncement, isPending: settingAnn } =
    useSetAnnouncement();
  const { mutateAsync: initData, isPending: initializing } =
    useInitializeSampleData();
  const { mutateAsync: creditWallet, isPending: crediting } = useCreditWallet();
  const { mutateAsync: approveRequest } = useApproveRechargeRequest();
  const { mutateAsync: rejectRequest } = useRejectRechargeRequest();
  const { mutateAsync: setSubAdmin } = useSetSubAdmin();
  const { mutateAsync: setSiteSettings, isPending: savingSite } =
    useSetSiteSettings();
  const { mutateAsync: setPaymentSettings, isPending: savingPayment } =
    useSetPaymentSettings();
  const { mutateAsync: addBanner, isPending: addingBanner } = useAddBanner();
  const { mutateAsync: updateBanner, isPending: updatingBanner } =
    useUpdateBanner();
  const { mutateAsync: deleteBanner } = useDeleteBanner();

  const [productForm, setProductForm] = useState<ProductInput>(emptyProduct);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [announcement, setAnnouncementText] = useState("");
  const [creditPrincipal, setCreditPrincipal] = useState("");
  const [creditAmount, setCreditAmount] = useState("");

  // Site settings state
  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // Payment settings state
  const [bkashNum, setBkashNum] = useState("");
  const [nagadNum, setNagadNum] = useState("");
  const [rocketNum, setRocketNum] = useState("");

  // Banner state
  const [bannerForm, setBannerForm] = useState<BannerInput>(emptyBanner);
  const [editingBannerId, setEditingBannerId] = useState<bigint | null>(null);
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);

  // Sync backend data into local state
  useEffect(() => {
    if (siteSettings) {
      setSiteName(siteSettings.siteName);
      setLogoUrl(siteSettings.logoUrl);
    }
  }, [siteSettings]);

  useEffect(() => {
    if (paymentSettings) {
      setBkashNum(paymentSettings.bkash);
      setNagadNum(paymentSettings.nagad);
      setRocketNum(paymentSettings.rocket);
    }
  }, [paymentSettings]);

  const handleProductSubmit = async () => {
    if (!productForm.name.trim()) {
      toast.error("Product name required");
      return;
    }
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, input: productForm });
        toast.success("প্রোডাক্ট আপডেট হয়েছে!");
      } else {
        await addProduct(productForm);
        toast.success("প্রোডাক্ট যোগ হয়েছে!");
      }
      setProductForm(emptyProduct);
      setEditingProduct(null);
      setProductDialogOpen(false);
    } catch {
      toast.error("অপারেশন ব্যর্থ হয়েছে");
    }
  };

  const handleDeleteProduct = async (id: bigint) => {
    try {
      await deleteProduct(id);
      toast.success("প্রোডাক্ট মুছে গেছে");
    } catch {
      toast.error("মুছতে ব্যর্থ হয়েছে");
    }
  };

  const handleStatusChange = async (orderId: bigint, status: OrderStatus) => {
    try {
      await updateStatus({ orderId, status });
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
    } catch {
      toast.error("আপডেট ব্যর্থ হয়েছে");
    }
  };

  const handleSetAnnouncement = async () => {
    try {
      await setAnnouncement(announcement);
      toast.success("ঘোষণা আপডেট হয়েছে!");
    } catch {
      toast.error("ব্যর্থ হয়েছে");
    }
  };

  const handleCreditWallet = async () => {
    try {
      await creditWallet({
        user: Principal.fromText(creditPrincipal),
        amount: BigInt(Number.parseInt(creditAmount) || 0),
      });
      toast.success("Wallet credited!");
      setCreditPrincipal("");
      setCreditAmount("");
    } catch {
      toast.error("Credit failed");
    }
  };

  const handleApprove = async (id: bigint) => {
    try {
      await approveRequest(id);
      toast.success("রিচার্জ অনুমোদিত হয়েছে!");
    } catch {
      toast.error("Approval failed");
    }
  };

  const handleReject = async (id: bigint) => {
    try {
      await rejectRequest(id);
      toast.success("রিচার্জ বাতিল করা হয়েছে।");
    } catch {
      toast.error("Rejection failed");
    }
  };

  const handleSaveSiteSettings = async () => {
    try {
      await setSiteSettings({ siteName, logoUrl });
      toast.success("সাইট সেটিংস সেভ হয়েছে!");
    } catch {
      toast.error("সেভ ব্যর্থ হয়েছে");
    }
  };

  const handleSavePaymentSettings = async () => {
    try {
      await setPaymentSettings({
        bkash: bkashNum,
        nagad: nagadNum,
        rocket: rocketNum,
      });
      toast.success("পেমেন্ট নম্বর সেভ হয়েছে!");
    } catch {
      toast.error("সেভ ব্যর্থ হয়েছে");
    }
  };

  const handleBannerSubmit = async () => {
    if (!bannerForm.title.trim()) {
      toast.error("ব্যানারের শিরোনাম দিন");
      return;
    }
    try {
      if (editingBannerId !== null) {
        await updateBanner({ id: editingBannerId, input: bannerForm });
        toast.success("ব্যানার আপডেট হয়েছে!");
      } else {
        await addBanner(bannerForm);
        toast.success("ব্যানার যোগ হয়েছে!");
      }
      setBannerForm(emptyBanner);
      setEditingBannerId(null);
      setBannerDialogOpen(false);
    } catch {
      toast.error("অপারেশন ব্যর্থ হয়েছে");
    }
  };

  const handleDeleteBanner = async (id: bigint) => {
    try {
      await deleteBanner(id);
      toast.success("ব্যানার মুছে গেছে");
    } catch {
      toast.error("মুছতে ব্যর্থ হয়েছে");
    }
  };

  const [activeTab, setActiveTab] = useState<string>("products");

  return (
    <div data-ocid="admin.page" className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-4 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <Settings size={16} />
        </div>
        <div>
          <h1 className="font-black text-base">Admin Panel</h1>
          {myAdminLevel && (
            <p className="text-[10px] text-gray-400">
              {myAdminLevel === AdminLevel.superAdmin
                ? "সুপার অ্যাডমিন"
                : myAdminLevel === AdminLevel.subAdmin
                  ? "সাব-অ্যাডমিন"
                  : ""}
            </p>
          )}
        </div>
      </header>

      {/* Mobile top nav */}
      <div className="md:hidden bg-gray-800 overflow-x-auto">
        <div className="flex px-2 py-1 gap-1 min-w-max" data-ocid="admin.tab">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`flex flex-col items-center px-3 py-2 rounded-lg text-[10px] font-semibold transition-colors ${activeTab === "products" ? "bg-orange-500 text-white" : "text-gray-300 hover:bg-gray-700"}`}
          >
            <span>📦</span>
            <span>পণ্য</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex flex-col items-center px-3 py-2 rounded-lg text-[10px] font-semibold transition-colors ${activeTab === "orders" ? "bg-orange-500 text-white" : "text-gray-300 hover:bg-gray-700"}`}
          >
            <span>🛒</span>
            <span>অর্ডার</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("recharge")}
            className={`flex flex-col items-center px-3 py-2 rounded-lg text-[10px] font-semibold transition-colors ${activeTab === "recharge" ? "bg-orange-500 text-white" : "text-gray-300 hover:bg-gray-700"}`}
          >
            <span>💳</span>
            <span>রিচার্জ</span>
          </button>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab("members")}
              className={`flex flex-col items-center px-3 py-2 rounded-lg text-[10px] font-semibold transition-colors ${activeTab === "members" ? "bg-orange-500 text-white" : "text-gray-300 hover:bg-gray-700"}`}
            >
              <span>👥</span>
              <span>মেম্বার</span>
            </button>
          )}
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`flex flex-col items-center px-3 py-2 rounded-lg text-[10px] font-semibold transition-colors ${activeTab === "settings" ? "bg-orange-500 text-white" : "text-gray-300 hover:bg-gray-700"}`}
            >
              <span>⚙️</span>
              <span>সেটিংস</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-gray-900 min-h-screen shrink-0">
          <div className="px-3 py-4 space-y-5">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-1">
                কন্টেন্ট ম্যানেজমেন্ট
              </p>
              <button
                data-ocid="admin.products.tab"
                type="button"
                onClick={() => setActiveTab("products")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "products" ? "bg-orange-500 text-white" : "text-gray-300 hover:bg-gray-800"}`}
              >
                <span>📦</span> পণ্য
              </button>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-1">
                অর্ডার ও রিচার্জ
              </p>
              <button
                data-ocid="admin.orders.tab"
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "orders" ? "bg-orange-500 text-white" : "text-gray-300 hover:bg-gray-800"}`}
              >
                <span>🛒</span> অর্ডার
              </button>
              <button
                data-ocid="admin.recharge.tab"
                type="button"
                onClick={() => setActiveTab("recharge")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors mt-0.5 ${activeTab === "recharge" ? "bg-orange-500 text-white" : "text-gray-300 hover:bg-gray-800"}`}
              >
                <span>💳</span> রিচার্জ
              </button>
            </div>
            {isSuperAdmin && (
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-1">
                  ইউজার ম্যানেজমেন্ট
                </p>
                <button
                  data-ocid="admin.members.tab"
                  type="button"
                  onClick={() => setActiveTab("members")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "members" ? "bg-orange-500 text-white" : "text-gray-300 hover:bg-gray-800"}`}
                >
                  <span>👥</span> মেম্বার
                </button>
              </div>
            )}
            {isSuperAdmin && (
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-1">
                  সাইট সেটিংস
                </p>
                <button
                  data-ocid="admin.settings.tab"
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "settings" ? "bg-orange-500 text-white" : "text-gray-300 hover:bg-gray-800"}`}
                >
                  <span>⚙️</span> সেটিংস
                </button>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 px-4 py-4 overflow-auto">
          {activeTab === "products" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">
                  {products?.length ?? 0} পণ্য
                </span>
                <Dialog
                  open={productDialogOpen}
                  onOpenChange={setProductDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      data-ocid="admin.product.open_modal_button"
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => {
                        setEditingProduct(null);
                        setProductForm(emptyProduct);
                      }}
                    >
                      <Plus size={14} className="mr-1" /> নতুন পণ্য
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    data-ocid="admin.product.dialog"
                    className="max-w-[380px]"
                  >
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "পণ্য সম্পাদনা" : "নতুন পণ্য যোগ করুন"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">নাম</Label>
                        <Input
                          data-ocid="admin.product.input"
                          value={productForm.name}
                          onChange={(e) =>
                            setProductForm((p) => ({
                              ...p,
                              name: e.target.value,
                            }))
                          }
                          placeholder="পণ্যের নাম"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">বিবরণ</Label>
                        <Textarea
                          data-ocid="admin.product.textarea"
                          value={productForm.description}
                          onChange={(e) =>
                            setProductForm((p) => ({
                              ...p,
                              description: e.target.value,
                            }))
                          }
                          placeholder="বিবরণ"
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">দাম (টাকা)</Label>
                        <Input
                          value={productForm.price.toString()}
                          onChange={(e) =>
                            setProductForm((p) => ({
                              ...p,
                              price: BigInt(
                                Number.parseInt(e.target.value) || 0,
                              ),
                            }))
                          }
                          type="number"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">ছবির URL</Label>
                        <Input
                          value={productForm.imageUrl}
                          onChange={(e) =>
                            setProductForm((p) => ({
                              ...p,
                              imageUrl: e.target.value,
                            }))
                          }
                          placeholder="/assets/..."
                        />
                      </div>
                      <div>
                        <Label className="text-xs">ক্যাটাগরি</Label>
                        <Input
                          value={productForm.category}
                          onChange={(e) =>
                            setProductForm((p) => ({
                              ...p,
                              category: e.target.value,
                            }))
                          }
                          placeholder="free-fire"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            data-ocid="admin.product.switch"
                            checked={productForm.isFeatured}
                            onCheckedChange={(v) =>
                              setProductForm((p) => ({ ...p, isFeatured: v }))
                            }
                          />
                          <Label className="text-xs">ফিচার্ড</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={productForm.isActive}
                            onCheckedChange={(v) =>
                              setProductForm((p) => ({ ...p, isActive: v }))
                            }
                          />
                          <Label className="text-xs">সক্রিয়</Label>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          data-ocid="admin.product.cancel_button"
                          variant="outline"
                          onClick={() => setProductDialogOpen(false)}
                          className="flex-1"
                        >
                          বাতিল
                        </Button>
                        <Button
                          data-ocid="admin.product.submit_button"
                          onClick={handleProductSubmit}
                          disabled={addingProduct}
                          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          {addingProduct && (
                            <Loader2 size={14} className="animate-spin mr-1" />
                          )}
                          {editingProduct ? "আপডেট" : "যোগ করুন"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {products?.map((p, i) => (
                <div
                  key={p.id.toString()}
                  data-ocid={`admin.product.item.${i + 1}`}
                  className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-orange-600 font-bold">
                        ৳ {p.price.toString()}
                      </span>
                      {p.isFeatured && (
                        <Badge className="text-[10px] bg-yellow-100 text-yellow-700 border-0 px-1.5">
                          HOT
                        </Badge>
                      )}
                      {!p.isActive && (
                        <Badge className="text-[10px] bg-red-100 text-red-600 border-0 px-1.5">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      type="button"
                      data-ocid={`admin.product.edit_button.${i + 1}`}
                      onClick={() => {
                        setEditingProduct(p);
                        setProductForm({
                          name: p.name,
                          description: p.description,
                          price: p.price,
                          imageUrl: p.imageUrl,
                          category: p.category,
                          isFeatured: p.isFeatured,
                          isActive: p.isActive,
                        });
                        setProductDialogOpen(true);
                      }}
                      className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100"
                    >
                      <Edit3 size={14} className="text-blue-600" />
                    </button>
                    <button
                      type="button"
                      data-ocid={`admin.product.delete_button.${i + 1}`}
                      onClick={() => handleDeleteProduct(p.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-3">
              {orders?.map((order, i) => (
                <div
                  key={order.id.toString()}
                  data-ocid={`admin.order.item.${i + 1}`}
                  className="bg-white rounded-xl border border-gray-100 p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">
                        {order.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.gameId} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className="font-bold text-orange-600 text-sm ml-2">
                      ৳ {order.totalPrice.toString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[11px] text-gray-400">মেম্বার:</span>
                    <MemberCodeBadge principalId={order.userId.toString()} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        statusColors[order.status]
                      }`}
                    >
                      {order.status}
                    </span>
                    <Select
                      value={order.status}
                      onValueChange={(v) =>
                        handleStatusChange(order.id, v as OrderStatus)
                      }
                    >
                      <SelectTrigger
                        data-ocid={`admin.order.select.${i + 1}`}
                        className="h-7 text-xs flex-1"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem
                            key={s.value}
                            value={s.value}
                            className="text-xs"
                          >
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              {(!orders || orders.length === 0) && (
                <div
                  data-ocid="admin.orders.empty_state"
                  className="text-center py-12 text-gray-400"
                >
                  <p className="text-sm">কোনো অর্ডার নেই</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "recharge" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-700">
                  {rechargeRequests?.length ?? 0} রিচার্জ রিকোয়েস্ট
                </span>
              </div>
              {(!rechargeRequests || rechargeRequests.length === 0) && (
                <div
                  data-ocid="admin.recharge.empty_state"
                  className="text-center py-12 text-gray-400"
                >
                  <p className="text-sm">কোনো রিচার্জ রিকোয়েস্ট নেই</p>
                </div>
              )}
              {rechargeRequests?.map((req, i) => (
                <div
                  key={req.id.toString()}
                  data-ocid={`admin.recharge.item.${i + 1}`}
                  className="bg-white rounded-xl border border-gray-100 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-orange-600 text-base">
                      ৳{req.amount.toString()}
                    </span>
                    <RechargeStatusBadge status={req.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <div>
                      <span className="text-gray-400">পেমেন্ট: </span>
                      <span className="font-semibold text-gray-700">
                        {METHOD_LABEL[req.paymentMethod] ?? req.paymentMethod}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">তারিখ: </span>
                      <span className="font-semibold text-gray-700">
                        {formatDate(req.createdAt)}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">TrxID: </span>
                      <span className="font-mono font-semibold text-gray-700">
                        {req.transactionId}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1.5">
                      <span className="text-gray-400">মেম্বার: </span>
                      <MemberCodeBadge principalId={req.user.toString()} />
                    </div>
                  </div>
                  {req.status === RequestStatus.pending && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        data-ocid={`admin.recharge.confirm_button.${i + 1}`}
                        size="sm"
                        onClick={() => handleApprove(req.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs h-8"
                      >
                        <CheckCircle2 size={13} className="mr-1" /> অনুমোদন
                      </Button>
                      <Button
                        data-ocid={`admin.recharge.delete_button.${i + 1}`}
                        size="sm"
                        onClick={() => handleReject(req.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs h-8"
                      >
                        <XCircle size={13} className="mr-1" /> বাতিল
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Members Tab -- Super Admin only */}
          {isSuperAdmin && activeTab === "members" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  <Users size={15} className="text-orange-500" />
                  সকল মেম্বার
                </h3>
                <p className="text-xs text-gray-500">
                  সকল মেম্বারের তালিকা দেখুন এবং রোল পরিবর্তন করুন।
                </p>
              </div>

              <MembersListTab
                orders={orders}
                rechargeRequests={rechargeRequests}
                setSubAdmin={setSubAdmin}
              />
            </div>
          )}

          {/* Settings Tab -- Super Admin only */}
          {isSuperAdmin && activeTab === "settings" && (
            <div className="space-y-4">
              {/* Section A: Site Settings */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  🌐 সাইট সেটিংস
                </h3>
                <div>
                  <Label className="text-xs mb-1 block">সাইটের নাম</Label>
                  <Input
                    data-ocid="admin.site.input"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Game Topup Shop"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">লোগো URL</Label>
                  <Input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="/assets/logo.png"
                  />
                </div>
                <Button
                  data-ocid="admin.site.save_button"
                  onClick={handleSaveSiteSettings}
                  disabled={savingSite}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {savingSite && (
                    <Loader2 size={14} className="animate-spin mr-1" />
                  )}
                  সেভ করুন
                </Button>
              </div>

              {/* Section B: Payment Numbers */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  💳 পেমেন্ট নম্বর
                </h3>
                <div>
                  <Label className="text-xs mb-1 block">বিকাশ নম্বর</Label>
                  <Input
                    data-ocid="admin.payment.bkash_input"
                    value={bkashNum}
                    onChange={(e) => setBkashNum(e.target.value)}
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">নগদ নম্বর</Label>
                  <Input
                    data-ocid="admin.payment.nagad_input"
                    value={nagadNum}
                    onChange={(e) => setNagadNum(e.target.value)}
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">রকেট নম্বর</Label>
                  <Input
                    data-ocid="admin.payment.rocket_input"
                    value={rocketNum}
                    onChange={(e) => setRocketNum(e.target.value)}
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                <Button
                  data-ocid="admin.payment.save_button"
                  onClick={handleSavePaymentSettings}
                  disabled={savingPayment}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {savingPayment && (
                    <Loader2 size={14} className="animate-spin mr-1" />
                  )}
                  সেভ করুন
                </Button>
              </div>

              {/* Section C: Announcement */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                <h3 className="font-bold text-sm text-gray-800">📢 ঘোষণা</h3>
                <Textarea
                  data-ocid="admin.announcement.textarea"
                  value={announcement}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="ঘোষণার টেক্সট লিখুন..."
                  rows={3}
                />
                <Button
                  data-ocid="admin.announcement.submit_button"
                  onClick={handleSetAnnouncement}
                  disabled={settingAnn}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {settingAnn && (
                    <Loader2 size={14} className="animate-spin mr-1" />
                  )}
                  ঘোষণা আপডেট করুন
                </Button>
              </div>

              {/* Section D: Banner Management */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    <ImageIcon size={15} className="text-orange-500" /> ব্যানার
                    ম্যানেজমেন্ট
                  </h3>
                  <Dialog
                    open={bannerDialogOpen}
                    onOpenChange={setBannerDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        data-ocid="admin.banner.open_modal_button"
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
                        onClick={() => {
                          setEditingBannerId(null);
                          setBannerForm(emptyBanner);
                        }}
                      >
                        <Plus size={13} className="mr-1" /> নতুন ব্যানার
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      data-ocid="admin.banner.dialog"
                      className="max-w-[380px]"
                    >
                      <DialogHeader>
                        <DialogTitle>
                          {editingBannerId !== null
                            ? "ব্যানার সম্পাদনা"
                            : "নতুন ব্যানার যোগ করুন"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">শিরোনাম</Label>
                          <Input
                            data-ocid="admin.banner.input"
                            value={bannerForm.title}
                            onChange={(e) =>
                              setBannerForm((b) => ({
                                ...b,
                                title: e.target.value,
                              }))
                            }
                            placeholder="ব্যানারের শিরোনাম"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">বিবরণ</Label>
                          <Textarea
                            data-ocid="admin.banner.textarea"
                            value={bannerForm.description}
                            onChange={(e) =>
                              setBannerForm((b) => ({
                                ...b,
                                description: e.target.value,
                              }))
                            }
                            placeholder="বিবরণ (ঐচ্ছিক)"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">ছবির URL</Label>
                          <Input
                            value={bannerForm.imageUrl}
                            onChange={(e) =>
                              setBannerForm((b) => ({
                                ...b,
                                imageUrl: e.target.value,
                              }))
                            }
                            placeholder="/assets/..."
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            data-ocid="admin.banner.switch"
                            checked={bannerForm.isActive}
                            onCheckedChange={(v) =>
                              setBannerForm((b) => ({ ...b, isActive: v }))
                            }
                          />
                          <Label className="text-xs">সক্রিয়</Label>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            data-ocid="admin.banner.cancel_button"
                            variant="outline"
                            onClick={() => setBannerDialogOpen(false)}
                            className="flex-1"
                          >
                            বাতিল
                          </Button>
                          <Button
                            data-ocid="admin.banner.submit_button"
                            onClick={handleBannerSubmit}
                            disabled={addingBanner || updatingBanner}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            {(addingBanner || updatingBanner) && (
                              <Loader2
                                size={14}
                                className="animate-spin mr-1"
                              />
                            )}
                            {editingBannerId !== null ? "আপডেট" : "যোগ করুন"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {(!banners || banners.length === 0) && (
                  <div
                    data-ocid="admin.banner.empty_state"
                    className="text-center py-8 text-gray-400"
                  >
                    <p className="text-sm">কোনো ব্যানার নেই</p>
                  </div>
                )}

                {banners?.map((banner, i) => (
                  <div
                    key={banner.id.toString()}
                    data-ocid={`admin.banner.item.${i + 1}`}
                    className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl"
                  >
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-12 h-10 object-cover rounded-lg bg-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <ImageIcon size={14} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-gray-800 truncate">
                        {banner.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {banner.isActive ? (
                          <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                            সক্রিয়
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            নিষ্ক্রিয়
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        data-ocid={`admin.banner.edit_button.${i + 1}`}
                        onClick={() => {
                          setEditingBannerId(banner.id);
                          setBannerForm({
                            title: banner.title,
                            description: banner.description,
                            imageUrl: banner.imageUrl,
                            isActive: banner.isActive,
                          });
                          setBannerDialogOpen(true);
                        }}
                        className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100"
                      >
                        <Edit3 size={12} className="text-blue-600" />
                      </button>
                      <button
                        type="button"
                        data-ocid={`admin.banner.delete_button.${i + 1}`}
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100"
                      >
                        <Trash2 size={12} className="text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Credit Wallet */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                <h3 className="font-bold text-sm text-gray-800">
                  💰 ওয়ালেট ক্রেডিট করুন
                </h3>
                <Input
                  data-ocid="admin.credit.input"
                  placeholder="User Principal ID"
                  value={creditPrincipal}
                  onChange={(e) => setCreditPrincipal(e.target.value)}
                />
                <Input
                  placeholder="পরিমাণ (টাকা)"
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                />
                <Button
                  data-ocid="admin.credit.submit_button"
                  onClick={handleCreditWallet}
                  disabled={crediting}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  {crediting && (
                    <Loader2 size={14} className="animate-spin mr-1" />
                  )}
                  ক্রেডিট করুন
                </Button>
              </div>

              {/* Initialize Data */}
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <h3 className="font-bold text-sm text-gray-800 mb-3">
                  🔄 নমুনা ডেটা
                </h3>
                <Button
                  data-ocid="admin.init.button"
                  onClick={() =>
                    initData()
                      .then(() => toast.success("নমুনা ডেটা তৈরি হয়েছে!"))
                      .catch(() => toast.error("ব্যর্থ হয়েছে"))
                  }
                  disabled={initializing}
                  variant="outline"
                  className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  {initializing && (
                    <Loader2 size={14} className="animate-spin mr-1" />
                  )}
                  নমুনা ডেটা ইনিশিয়ালাইজ করুন
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
