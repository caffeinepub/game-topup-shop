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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@icp-sdk/core/principal";
import { Edit3, Loader2, Plus, Settings, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../backend.d";
import type { Product, ProductInput } from "../backend.d";
import {
  useAddProduct,
  useAllOrders,
  useCreditWallet,
  useDeleteProduct,
  useInitializeSampleData,
  useProducts,
  useSetAnnouncement,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";

const emptyProduct: ProductInput = {
  name: "",
  description: "",
  price: BigInt(0),
  imageUrl: "",
  category: "free-fire",
  isFeatured: false,
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

export default function AdminPage() {
  const { data: products } = useProducts();
  const { data: orders } = useAllOrders();
  const { mutateAsync: addProduct, isPending: addingProduct } = useAddProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const { mutateAsync: deleteProduct } = useDeleteProduct();
  const { mutateAsync: updateStatus } = useUpdateOrderStatus();
  const { mutateAsync: setAnnouncement, isPending: settingAnn } =
    useSetAnnouncement();
  const { mutateAsync: initData, isPending: initializing } =
    useInitializeSampleData();
  const { mutateAsync: creditWallet, isPending: crediting } = useCreditWallet();

  const [productForm, setProductForm] = useState<ProductInput>(emptyProduct);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [announcement, setAnnouncementText] = useState("");
  const [creditPrincipal, setCreditPrincipal] = useState("");
  const [creditAmount, setCreditAmount] = useState("");

  const handleProductSubmit = async () => {
    if (!productForm.name.trim()) {
      toast.error("Product name required");
      return;
    }
    try {
      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, input: productForm });
        toast.success("Product updated!");
      } else {
        await addProduct(productForm);
        toast.success("Product added!");
      }
      setProductForm(emptyProduct);
      setEditingProduct(null);
      setProductDialogOpen(false);
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDeleteProduct = async (id: bigint) => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleStatusChange = async (orderId: bigint, status: OrderStatus) => {
    try {
      await updateStatus({ orderId, status });
      toast.success("Status updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const handleSetAnnouncement = async () => {
    try {
      await setAnnouncement(announcement);
      toast.success("Announcement updated!");
    } catch {
      toast.error("Failed");
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

  return (
    <div data-ocid="admin.page" className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-4 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <Settings size={16} />
        </div>
        <h1 className="font-black text-base">Admin Panel</h1>
      </header>

      <div className="px-4 py-4">
        <Tabs defaultValue="products">
          <TabsList
            data-ocid="admin.tab"
            className="w-full mb-4 bg-white border"
          >
            <TabsTrigger value="products" className="flex-1 text-xs">
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 text-xs">
              Orders
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 text-xs">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">
                {products?.length ?? 0} Products
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
                    <Plus size={14} className="mr-1" /> Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent
                  data-ocid="admin.product.dialog"
                  className="max-w-[380px]"
                >
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Edit Product" : "Add Product"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        data-ocid="admin.product.input"
                        value={productForm.name}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Product name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        data-ocid="admin.product.textarea"
                        value={productForm.description}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Description"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Price (Tk)</Label>
                      <Input
                        value={productForm.price.toString()}
                        onChange={(e) =>
                          setProductForm((p) => ({
                            ...p,
                            price: BigInt(Number.parseInt(e.target.value) || 0),
                          }))
                        }
                        type="number"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Image URL</Label>
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
                      <Label className="text-xs">Category</Label>
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
                        <Label className="text-xs">Featured</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={productForm.isActive}
                          onCheckedChange={(v) =>
                            setProductForm((p) => ({ ...p, isActive: v }))
                          }
                        />
                        <Label className="text-xs">Active</Label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-ocid="admin.product.cancel_button"
                        variant="outline"
                        onClick={() => setProductDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
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
                        {editingProduct ? "Update" : "Add"}
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
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-3">
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
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[order.status]}`}
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
                <p className="text-sm">No orders yet</p>
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            {/* Announcement */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              <h3 className="font-bold text-sm text-gray-800">
                📢 Announcement
              </h3>
              <Textarea
                data-ocid="admin.announcement.textarea"
                value={announcement}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Enter announcement text..."
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
                Update Announcement
              </Button>
            </div>

            {/* Credit Wallet */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              <h3 className="font-bold text-sm text-gray-800">
                💰 Credit Wallet
              </h3>
              <Input
                data-ocid="admin.credit.input"
                placeholder="User Principal ID"
                value={creditPrincipal}
                onChange={(e) => setCreditPrincipal(e.target.value)}
              />
              <Input
                placeholder="Amount (Tk)"
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
                Credit Wallet
              </Button>
            </div>

            {/* Initialize Data */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-bold text-sm text-gray-800 mb-3">
                🔄 Sample Data
              </h3>
              <Button
                data-ocid="admin.init.button"
                onClick={() =>
                  initData()
                    .then(() => toast.success("Sample data initialized!"))
                    .catch(() => toast.error("Failed"))
                }
                disabled={initializing}
                variant="outline"
                className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                {initializing && (
                  <Loader2 size={14} className="animate-spin mr-1" />
                )}
                Initialize Sample Data
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
