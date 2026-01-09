import { createClient } from "@/lib/supabase/client";
import {
  QueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

interface ResourceOptionsProps
  extends Omit<QueryOptions, "queryKey" | "queryFn"> {
  key: string[];
  fn: () => Promise<any>;
  select?: (data: any) => any;
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  placeholderData?: any;
  staleTime?: number;
}

interface MutationOptionsProps<T, Variables = any>
  extends Omit<
    UseMutationOptions<T, unknown, Variables, unknown>,
    "mutationKey" | "mutationFn"
  > {
  key: string[];
  fn: (variables: Variables) => Promise<any>;
  onSuccess?: (data: any, variables?: Variables, context?: any) => void;
  onError?: (error: any, variables?: Variables, context?: any) => void;
  invalidateAll?: boolean;
}

export const useModifyResource = <T>(options: MutationOptionsProps<T>) => {
  const { key, fn, onSuccess, onError, invalidateAll, ...mutationOptions } =
    options;
  const queryClient = useQueryClient();

  return useMutation({
    ...mutationOptions,
    mutationFn: fn,
    onSuccess: (data) => {
      onSuccess?.(data);

      if (invalidateAll) {
        queryClient.invalidateQueries();
      } else if (key?.[0]) {
        queryClient.invalidateQueries({
          queryKey: [key[0]]
        });
      }
    },
    onError: (e: AxiosError) => {
      onError?.(e) || toast.error(e.message || "Error");
      throw e;
    }
  });
};
export const useGetResource = (options: ResourceOptionsProps) => {
  const { key, fn, select, onSuccess, onError, ...rest } = options;

  const query = useQuery({
    ...rest,
    queryKey: key || ["defaultKey"],
    queryFn: async () => {
      try {
        const response = await fn();
        if (response?.error) {
          throw new Error(response.error || "Something went wrong");
        }
        return response;
      } catch (error) {
        throw error;
      }
    },
    select: select ? (data) => select!(data) : undefined
  });

  const { data, error, isSuccess, isError } = query;

  React.useEffect(() => {
    if (isSuccess && data && onSuccess) {
      onSuccess(data);
    }
  }, [data, isSuccess, onSuccess]);

  React.useEffect(() => {
    if (isError && error && onError) {
      onError(error);
    }
  }, [error, isError, onError]);

  return query;
};

export const useAuth = () => {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user, isLoading } = useGetResource({
    key: ["auth", "user"],
    fn: async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    }
  });

  const logout = useModifyResource({
    key: ["auth"],
    fn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return null;
    },
    onSuccess: async () => {
      // Remove user from cache immediately
      queryClient.setQueryData(["auth", "user"], null);
      // Invalidate all other queries but keep auth state clean
      await queryClient.invalidateQueries();
      // Small delay to ensure session is cleared server-side before redirect
      await new Promise((resolve) => setTimeout(resolve, 200));
      // router.push("/login");
      //  window reload
      window.location.reload();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to logout");
    },
    invalidateAll: false
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logout.mutate,
    isLoggingOut: logout.isPending
  };
};
