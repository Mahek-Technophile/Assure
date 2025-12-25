import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type InsertKycRequest = z.infer<typeof api.kyc.create.input>;
type UpdateKycRequest = z.infer<typeof api.kyc.update.input>;

export function useKycRequests() {
  return useQuery({
    queryKey: [api.kyc.list.path],
    queryFn: async () => {
      const res = await fetch(api.kyc.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch KYC requests");
      return api.kyc.list.responses[200].parse(await res.json());
    },
  });
}

export function useKycRequest(id: number) {
  return useQuery({
    queryKey: [api.kyc.get.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.kyc.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch KYC request");
      return api.kyc.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateKycRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertKycRequest) => {
      const res = await fetch(api.kyc.create.path, {
        method: api.kyc.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create KYC request");
      return api.kyc.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.kyc.list.path] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useUpdateKycRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateKycRequest) => {
      const url = buildUrl(api.kyc.update.path, { id });
      const res = await fetch(url, {
        method: api.kyc.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update KYC request");
      return api.kyc.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.kyc.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.kyc.get.path, data.id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
