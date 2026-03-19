import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateOrderInput,
  OrderStatus,
  ProductInput,
  RechargeRequestInput,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFeaturedProducts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["featuredProducts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAnnouncement() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["announcement"],
    queryFn: async () => {
      if (!actor) return "";
      return actor.getAnnouncement();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWalletBalance() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["walletBalance"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getWalletBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyAdminLevel() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myAdminLevel"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyAdminLevel();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myOrders"] });
      qc.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.addProduct(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["featuredProducts"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: bigint; input: ProductInput }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProduct(id, input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["featuredProducts"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["featuredProducts"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}

export function useCreditWallet() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      amount,
    }: { user: Principal; amount: bigint }) => {
      if (!actor) throw new Error("Not connected");
      return actor.creditWallet(user, amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });
}

export function useSetAnnouncement() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.setAnnouncement(text);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcement"] });
    },
  });
}

export function useInitializeSampleData() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.initializeSampleData();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["featuredProducts"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useRechargeRequests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["rechargeRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRechargeRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllRechargeRequests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["rechargeRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRechargeRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitRechargeRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RechargeRequestInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitRechargeRequest(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rechargeRequests"] });
    },
  });
}

export function useApproveRechargeRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.approveRechargeRequest(requestId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rechargeRequests"] });
      qc.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });
}

export function useRejectRechargeRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.rejectRechargeRequest(requestId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rechargeRequests"] });
    },
  });
}

export function useLookupMember() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error("Not connected");
      const [profile, adminLevel] = await Promise.all([
        actor.getUserProfile(principal),
        actor.getUserAdminLevel(principal),
      ]);
      return { profile, adminLevel };
    },
  });
}

export function useAssignRole() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      user,
      role,
    }: { user: Principal; role: import("../backend.d").UserRole }) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignCallerUserRole(user, role);
    },
  });
}

export function useSetSubAdmin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      user,
      enable,
    }: { user: Principal; enable: boolean }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setSubAdmin(user, enable);
    },
  });
}
