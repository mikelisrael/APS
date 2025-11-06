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
  const router = useRouter();
  const supabase = createClient();

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
    onSuccess: () => {
      router.push("/login");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to logout");
    },
    invalidateAll: true
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logout.mutate,
    isLoggingOut: logout.isPending
  };
};

