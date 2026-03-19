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
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: number;
  isActive: boolean;
}

const STORAGE_KEY = "admin_offers";

function loadOffers(): Offer[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Offer[];
  } catch {
    return [];
  }
}

function saveOffers(offers: Offer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
}

const defaultOffers: Offer[] = [
  {
    id: "1",
    title: "গ্রীষ্মকালীন বিশেষ অফার",
    description: "সব Free Fire টপআপে ১০% ছাড়",
    discount: 10,
    isActive: true,
  },
  {
    id: "2",
    title: "প্রথমবার টপআপ",
    description: "নতুন ইউজারদের জন্য ৫% বোনাস ডায়মন্ড",
    discount: 5,
    isActive: true,
  },
  {
    id: "3",
    title: "বাল্ক অফার",
    description: "১০০০+ টাকা টপআপে ১৫% এক্সট্রা",
    discount: 15,
    isActive: false,
  },
];

const emptyOffer = { title: "", description: "", discount: 0, isActive: true };

export default function OffersTab() {
  const [offers, setOffers] = useState<Offer[]>(() => {
    const loaded = loadOffers();
    if (loaded.length === 0) {
      saveOffers(defaultOffers);
      return defaultOffers;
    }
    return loaded;
  });
  const [form, setForm] = useState(emptyOffer);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    if (editingId) {
      const updated = offers.map((o) =>
        o.id === editingId ? { ...o, ...form } : o,
      );
      setOffers(updated);
      saveOffers(updated);
      toast.success("অফার আপডেট হয়েছে");
    } else {
      const newOffer: Offer = { id: Date.now().toString(), ...form };
      const updated = [...offers, newOffer];
      setOffers(updated);
      saveOffers(updated);
      toast.success("অফার যোগ হয়েছে");
    }
    setSaving(false);
    setOpen(false);
    setEditingId(null);
    setForm(emptyOffer);
  };

  const handleDelete = (id: string) => {
    const updated = offers.filter((o) => o.id !== id);
    setOffers(updated);
    saveOffers(updated);
    toast.success("অফার মুছে ফেলা হয়েছে");
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-300">
          {offers.length} অফার
        </span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="admin.offer.open_modal_button"
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => {
                setEditingId(null);
                setForm(emptyOffer);
              }}
            >
              <Plus size={14} className="mr-1" /> নতুন অফার
            </Button>
          </DialogTrigger>
          <DialogContent
            data-ocid="admin.offer.dialog"
            className="max-w-sm bg-gray-900 border-gray-700 text-white"
          >
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingId ? "অফার সম্পাদনা" : "নতুন অফার যোগ করুন"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-400">শিরোনাম</Label>
                <Input
                  data-ocid="admin.offer.input"
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="অফারের শিরোনাম"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">বিবরণ</Label>
                <Textarea
                  data-ocid="admin.offer.textarea"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="অফারের বিবরণ"
                  rows={2}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">ছাড় (%)</Label>
                <Input
                  value={form.discount.toString()}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      discount: Number.parseInt(e.target.value) || 0,
                    }))
                  }
                  type="number"
                  placeholder="10"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  data-ocid="admin.offer.cancel_button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  বাতিল
                </Button>
                <Button
                  data-ocid="admin.offer.submit_button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {saving && (
                    <Loader2 size={14} className="animate-spin mr-1" />
                  )}
                  {editingId ? "আপডেট" : "যোগ করুন"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {offers.length === 0 && (
        <div
          data-ocid="admin.offers.empty_state"
          className="text-center py-12 text-gray-500"
        >
          <Tag size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">কোনো অফার নেই</p>
        </div>
      )}

      {offers.map((offer, i) => (
        <div
          key={offer.id}
          data-ocid={`admin.offer.item.${i + 1}`}
          className="bg-gray-900 rounded-xl border border-gray-800 p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold text-white text-sm truncate">
                  {offer.title}
                </h3>
                <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                  {offer.discount}% ছাড়
                </span>
                {!offer.isActive && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-700 text-gray-400">
                    নিষ্ক্রিয়
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{offer.description}</p>
            </div>
            <div className="flex gap-1 ml-2 shrink-0">
              <button
                type="button"
                data-ocid={`admin.offer.edit_button.${i + 1}`}
                onClick={() => {
                  setEditingId(offer.id);
                  setForm({
                    title: offer.title,
                    description: offer.description,
                    discount: offer.discount,
                    isActive: offer.isActive,
                  });
                  setOpen(true);
                }}
                className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center hover:bg-blue-500/20 transition-colors"
              >
                <Edit3 size={14} className="text-blue-400" />
              </button>
              <button
                type="button"
                data-ocid={`admin.offer.delete_button.${i + 1}`}
                onClick={() => handleDelete(offer.id)}
                className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors"
              >
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
