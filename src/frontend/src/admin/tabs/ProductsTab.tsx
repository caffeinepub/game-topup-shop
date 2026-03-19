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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Loader2, Package, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product, ProductInput } from "../../backend.d";
import {
  useAddProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "../../hooks/useQueries";

const emptyProduct: ProductInput = {
  name: "",
  description: "",
  price: BigInt(0),
  imageUrl: "",
  category: "free-fire",
  isFeatured: false,
  isActive: true,
};

export default function ProductsTab() {
  const { data: products } = useProducts();
  const { mutateAsync: addProduct, isPending: addingProduct } = useAddProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const { mutateAsync: deleteProduct } = useDeleteProduct();

  const [form, setForm] = useState<ProductInput>(emptyProduct);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    try {
      if (editing) {
        await updateProduct({ id: editing.id, input: form });
        toast.success("পণ্য আপডেট হয়েছে");
      } else {
        await addProduct(form);
        toast.success("পণ্য যোগ হয়েছে");
      }
      setOpen(false);
      setEditing(null);
      setForm(emptyProduct);
    } catch {
      toast.error("ব্যর্থ হয়েছে");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteProduct(id);
      toast.success("পণ্য মুছে ফেলা হয়েছে");
    } catch {
      toast.error("ব্যর্থ হয়েছে");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-300">
          {products?.length ?? 0} পণ্য
        </span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="admin.product.open_modal_button"
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => {
                setEditing(null);
                setForm(emptyProduct);
              }}
            >
              <Plus size={14} className="mr-1" /> নতুন পণ্য
            </Button>
          </DialogTrigger>
          <DialogContent
            data-ocid="admin.product.dialog"
            className="max-w-sm bg-gray-900 border-gray-700 text-white"
          >
            <DialogHeader>
              <DialogTitle className="text-white">
                {editing ? "পণ্য সম্পাদনা" : "নতুন পণ্য যোগ করুন"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-400">নাম</Label>
                <Input
                  data-ocid="admin.product.input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="পণ্যের নাম"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">বিবরণ</Label>
                <Textarea
                  data-ocid="admin.product.textarea"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="বিবরণ"
                  rows={2}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">দাম (টাকা)</Label>
                <Input
                  value={form.price.toString()}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      price: BigInt(Number.parseInt(e.target.value) || 0),
                    }))
                  }
                  type="number"
                  placeholder="0"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">ছবির URL</Label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  placeholder="/assets/..."
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">ক্যাটাগরি</Label>
                <Input
                  value={form.category}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, category: e.target.value }))
                  }
                  placeholder="free-fire"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    data-ocid="admin.product.switch"
                    checked={form.isFeatured}
                    onCheckedChange={(v) =>
                      setForm((p) => ({ ...p, isFeatured: v }))
                    }
                  />
                  <Label className="text-xs text-gray-400">ফিচার্ড</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) =>
                      setForm((p) => ({ ...p, isActive: v }))
                    }
                  />
                  <Label className="text-xs text-gray-400">সক্রিয়</Label>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  data-ocid="admin.product.cancel_button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  বাতিল
                </Button>
                <Button
                  data-ocid="admin.product.submit_button"
                  onClick={handleSubmit}
                  disabled={addingProduct}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {addingProduct && (
                    <Loader2 size={14} className="animate-spin mr-1" />
                  )}
                  {editing ? "আপডেট" : "যোগ করুন"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {(!products || products.length === 0) && (
        <div
          data-ocid="admin.products.empty_state"
          className="text-center py-12 text-gray-500"
        >
          <Package size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">কোনো পণ্য নেই</p>
        </div>
      )}

      {products?.map((p, i) => (
        <div
          key={p.id.toString()}
          data-ocid={`admin.product.item.${i + 1}`}
          className="bg-gray-900 rounded-xl border border-gray-800 p-3 flex items-center justify-between"
        >
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-white truncate">
              {p.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-orange-400 font-bold">
                ৳ {p.price.toString()}
              </span>
              <span className="text-xs text-gray-500">{p.category}</span>
              {p.isFeatured && (
                <Badge className="text-[10px] bg-yellow-500/20 text-yellow-400 border-0 px-1.5">
                  HOT
                </Badge>
              )}
              {!p.isActive && (
                <Badge className="text-[10px] bg-red-500/20 text-red-400 border-0 px-1.5">
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
                setEditing(p);
                setForm({
                  name: p.name,
                  description: p.description,
                  price: p.price,
                  imageUrl: p.imageUrl,
                  category: p.category,
                  isFeatured: p.isFeatured,
                  isActive: p.isActive,
                });
                setOpen(true);
              }}
              className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center hover:bg-blue-500/20 transition-colors"
            >
              <Edit3 size={14} className="text-blue-400" />
            </button>
            <button
              type="button"
              data-ocid={`admin.product.delete_button.${i + 1}`}
              onClick={() => handleDelete(p.id)}
              className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={14} className="text-red-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
