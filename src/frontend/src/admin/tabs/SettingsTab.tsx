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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@icp-sdk/core/principal";
import { Edit3, ImageIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { BannerInput } from "../../backend.d";
import {
  useAddBanner,
  useAnnouncement,
  useCreditWallet,
  useDeleteBanner,
  useGetBanners,
  useGetPaymentSettings,
  useGetSiteSettings,
  useInitializeSampleData,
  useSetAnnouncement,
  useSetPaymentSettings,
  useSetSiteSettings,
  useUpdateBanner,
} from "../../hooks/useQueries";

const emptyBanner: BannerInput = {
  title: "",
  description: "",
  imageUrl: "",
  isActive: true,
};

export default function SettingsTab() {
  const { data: siteSettings } = useGetSiteSettings();
  const { data: paymentSettings } = useGetPaymentSettings();
  const { data: banners } = useGetBanners();
  const { data: announcementData } = useAnnouncement();

  const { mutateAsync: setSiteSettings, isPending: savingSite } =
    useSetSiteSettings();
  const { mutateAsync: setPaymentSettings, isPending: savingPayment } =
    useSetPaymentSettings();
  const { mutateAsync: setAnnouncement, isPending: settingAnn } =
    useSetAnnouncement();
  const { mutateAsync: addBanner, isPending: addingBanner } = useAddBanner();
  const { mutateAsync: updateBanner, isPending: updatingBanner } =
    useUpdateBanner();
  const { mutateAsync: deleteBanner } = useDeleteBanner();
  const { mutateAsync: initData, isPending: initializing } =
    useInitializeSampleData();
  const { mutateAsync: creditWallet, isPending: crediting } = useCreditWallet();

  const [siteName, setSiteName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bkash, setBkash] = useState("01841956380");
  const [nagad, setNagad] = useState("01841956380");
  const [rocket, setRocket] = useState("01841956380");
  const [announcement, setAnnouncementText] = useState("");
  const [creditPrincipal, setCreditPrincipal] = useState("");
  const [creditAmount, setCreditAmount] = useState("");

  const [bannerForm, setBannerForm] = useState<BannerInput>(emptyBanner);
  const [editingBannerId, setEditingBannerId] = useState<bigint | null>(null);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    if (siteSettings) {
      setSiteName(siteSettings.siteName);
      setLogoUrl(siteSettings.logoUrl);
    }
  }, [siteSettings]);

  useEffect(() => {
    if (paymentSettings) {
      setBkash(paymentSettings.bkash);
      setNagad(paymentSettings.nagad);
      setRocket(paymentSettings.rocket);
    }
  }, [paymentSettings]);

  useEffect(() => {
    if (announcementData) setAnnouncementText(announcementData);
  }, [announcementData]);

  const handleSaveSite = async () => {
    try {
      await setSiteSettings({ siteName, logoUrl });
      toast.success("সাইট সেটিংস সেভ হয়েছে");
    } catch {
      toast.error("ব্যর্থ হয়েছে");
    }
  };

  const handleSavePayment = async () => {
    try {
      await setPaymentSettings({ bkash, nagad, rocket });
      toast.success("পেমেন্ট সেটিংস সেভ হয়েছে");
    } catch {
      toast.error("ব্যর্থ হয়েছে");
    }
  };

  const handleSaveAnnouncement = async () => {
    try {
      await setAnnouncement(announcement);
      toast.success("ঘোষণা আপডেট হয়েছে");
    } catch {
      toast.error("ব্যর্থ হয়েছে");
    }
  };

  const handleBannerSubmit = async () => {
    try {
      if (editingBannerId !== null) {
        await updateBanner({ id: editingBannerId, input: bannerForm });
        toast.success("ব্যানার আপডেট হয়েছে");
      } else {
        await addBanner(bannerForm);
        toast.success("ব্যানার যোগ হয়েছে");
      }
      setBannerOpen(false);
      setEditingBannerId(null);
      setBannerForm(emptyBanner);
    } catch {
      toast.error("ব্যর্থ হয়েছে");
    }
  };

  const handleDeleteBanner = async (id: bigint) => {
    try {
      await deleteBanner(id);
      toast.success("ব্যানার মুছে ফেলা হয়েছে");
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
      toast.success("ওয়ালেটে টাকা যোগ হয়েছে");
      setCreditPrincipal("");
      setCreditAmount("");
    } catch {
      toast.error("ব্যর্থ হয়েছে");
    }
  };

  const cardCls = "bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3";
  const inputCls =
    "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500";
  const labelCls = "text-xs text-gray-400 mb-1 block";

  return (
    <div className="space-y-4">
      {/* Site Settings */}
      <div className={cardCls}>
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          🌐 সাইট সেটিংস
        </h3>
        <div>
          <Label className={labelCls}>সাইটের নাম</Label>
          <Input
            data-ocid="admin.site.input"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Game Topup Shop"
            className={inputCls}
          />
        </div>
        <div>
          <Label className={labelCls}>লোগো URL</Label>
          <Input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="/assets/logo.png"
            className={inputCls}
          />
        </div>
        <Button
          data-ocid="admin.site.save_button"
          onClick={handleSaveSite}
          disabled={savingSite}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {savingSite && <Loader2 size={14} className="animate-spin mr-1" />}{" "}
          সেভ করুন
        </Button>
      </div>

      {/* Payment Numbers */}
      <div className={cardCls}>
        <h3 className="font-bold text-white text-sm">💳 পেমেন্ট নম্বর</h3>
        <div>
          <Label className={labelCls}>বিকাশ নম্বর</Label>
          <Input
            data-ocid="admin.payment.bkash_input"
            value={bkash}
            onChange={(e) => setBkash(e.target.value)}
            placeholder="01XXXXXXXXX"
            className={inputCls}
          />
        </div>
        <div>
          <Label className={labelCls}>নগদ নম্বর</Label>
          <Input
            data-ocid="admin.payment.nagad_input"
            value={nagad}
            onChange={(e) => setNagad(e.target.value)}
            placeholder="01XXXXXXXXX"
            className={inputCls}
          />
        </div>
        <div>
          <Label className={labelCls}>রকেট নম্বর</Label>
          <Input
            data-ocid="admin.payment.rocket_input"
            value={rocket}
            onChange={(e) => setRocket(e.target.value)}
            placeholder="01XXXXXXXXX"
            className={inputCls}
          />
        </div>
        <Button
          data-ocid="admin.payment.save_button"
          onClick={handleSavePayment}
          disabled={savingPayment}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {savingPayment && <Loader2 size={14} className="animate-spin mr-1" />}{" "}
          সেভ করুন
        </Button>
      </div>

      {/* Announcement */}
      <div className={cardCls}>
        <h3 className="font-bold text-white text-sm">📢 ঘোষণা</h3>
        <Textarea
          data-ocid="admin.announcement.textarea"
          value={announcement}
          onChange={(e) => setAnnouncementText(e.target.value)}
          placeholder="ঘোষণার টেক্সট লিখুন..."
          rows={3}
          className={inputCls}
        />
        <Button
          data-ocid="admin.announcement.submit_button"
          onClick={handleSaveAnnouncement}
          disabled={settingAnn}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {settingAnn && <Loader2 size={14} className="animate-spin mr-1" />}{" "}
          ঘোষণা আপডেট করুন
        </Button>
      </div>

      {/* Banner Management */}
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <ImageIcon size={15} className="text-orange-400" /> ব্যানার ম্যানেজমেন্ট
          </h3>
          <Dialog open={bannerOpen} onOpenChange={setBannerOpen}>
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
              className="max-w-sm bg-gray-900 border-gray-700 text-white"
            >
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingBannerId !== null ? "ব্যানার সম্পাদনা" : "নতুন ব্যানার"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className={labelCls}>শিরোনাম</Label>
                  <Input
                    data-ocid="admin.banner.input"
                    value={bannerForm.title}
                    onChange={(e) =>
                      setBannerForm((b) => ({ ...b, title: e.target.value }))
                    }
                    placeholder="ব্যানারের শিরোনাম"
                    className={inputCls}
                  />
                </div>
                <div>
                  <Label className={labelCls}>বিবরণ</Label>
                  <Textarea
                    data-ocid="admin.banner.textarea"
                    value={bannerForm.description}
                    onChange={(e) =>
                      setBannerForm((b) => ({
                        ...b,
                        description: e.target.value,
                      }))
                    }
                    placeholder="বিবরণ"
                    rows={2}
                    className={inputCls}
                  />
                </div>
                <div>
                  <Label className={labelCls}>ছবির URL</Label>
                  <Input
                    value={bannerForm.imageUrl}
                    onChange={(e) =>
                      setBannerForm((b) => ({ ...b, imageUrl: e.target.value }))
                    }
                    placeholder="/assets/..."
                    className={inputCls}
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
                  <Label className="text-xs text-gray-400">সক্রিয়</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    data-ocid="admin.banner.cancel_button"
                    variant="outline"
                    onClick={() => setBannerOpen(false)}
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
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
                      <Loader2 size={14} className="animate-spin mr-1" />
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
            className="text-center py-6 text-gray-500 text-sm"
          >
            কোনো ব্যানার নেই
          </div>
        )}

        {banners?.map((banner, i) => (
          <div
            key={banner.id.toString()}
            data-ocid={`admin.banner.item.${i + 1}`}
            className="flex items-center gap-3 p-3 border border-gray-800 rounded-xl"
          >
            <div className="w-12 h-10 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
              {banner.imageUrl ? (
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <ImageIcon size={14} className="text-gray-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs text-white truncate">
                {banner.title}
              </p>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${banner.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-400"}`}
              >
                {banner.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
              </span>
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
                  setBannerOpen(true);
                }}
                className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center hover:bg-blue-500/20"
              >
                <Edit3 size={12} className="text-blue-400" />
              </button>
              <button
                type="button"
                data-ocid={`admin.banner.delete_button.${i + 1}`}
                onClick={() => handleDeleteBanner(banner.id)}
                className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20"
              >
                <Trash2 size={12} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Credit Wallet */}
      <div className={cardCls}>
        <h3 className="font-bold text-white text-sm">💰 ওয়ালেট ক্রেডিট</h3>
        <Input
          data-ocid="admin.credit.input"
          placeholder="User Principal ID"
          value={creditPrincipal}
          onChange={(e) => setCreditPrincipal(e.target.value)}
          className={inputCls}
        />
        <Input
          placeholder="পরিমাণ (টাকা)"
          type="number"
          value={creditAmount}
          onChange={(e) => setCreditAmount(e.target.value)}
          className={inputCls}
        />
        <Button
          data-ocid="admin.credit.submit_button"
          onClick={handleCreditWallet}
          disabled={crediting}
          className="w-full bg-green-500 hover:bg-green-600 text-white"
        >
          {crediting && <Loader2 size={14} className="animate-spin mr-1" />}{" "}
          ক্রেডিট করুন
        </Button>
      </div>

      {/* Initialize Data */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h3 className="font-bold text-white text-sm mb-3">🔄 নমুনা ডেটা</h3>
        <Button
          data-ocid="admin.init.button"
          onClick={() =>
            initData()
              .then(() => toast.success("নমুনা ডেটা তৈরি হয়েছে!"))
              .catch(() => toast.error("ব্যর্থ হয়েছে"))
          }
          disabled={initializing}
          variant="outline"
          className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          {initializing && <Loader2 size={14} className="animate-spin mr-1" />}{" "}
          নমুনা ডেটা ইনিশিয়ালাইজ করুন
        </Button>
      </div>
    </div>
  );
}
