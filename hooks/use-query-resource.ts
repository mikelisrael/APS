import {
  QueryOptions,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";
import { AxiosError } from "axios";
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

interface InfiniteResourceOptionsProps<T = any>
  extends Omit<
    UseInfiniteQueryOptions<T, Error, T, T, readonly unknown[], unknown>,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  > {
  key: string[];
  fn: (pageParam: any) => Promise<any>;
  select?: (data: any) => any;
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  getNextPageParam?: (lastPage: any, allPages: any[]) => any;
  initialPageParam?: any;
}

interface MutationOptionsProps<T, Variables = any>
  extends Omit<
    UseMutationOptions<T, unknown, Variables, unknown>,
    "mutationKey" | "mutationFn"
  > {
  key: string[];
  fn: (variables: Variables) => Promise<any>;
  onSuccess?: (data: any) => void;
  onError?: (e: any) => void;
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

export const useInfiniteResource = <T = any>(
  options: InfiniteResourceOptionsProps<T>
) => {
  const {
    key,
    fn,
    select,
    onSuccess,
    onError,
    initialPageParam = 1,
    ...rest
  } = options;

  const query = useInfiniteQuery({
    ...rest,
    queryKey: key || ["defaultInfiniteKey"],
    queryFn: async ({ pageParam }) => {
      try {
        const response = await fn(pageParam);
        if (response?.error) {
          throw new Error(response.error || "Something went wrong");
        }
        return response;
      } catch (error) {
        throw error;
      }
    },
    initialPageParam,
    getNextPageParam: (lastPage: any) => {
      const meta = lastPage?.data?.meta;
      if (meta?.hasNextPage) {
        return meta.currentPage + 1;
      }
      return undefined;
    },
    select: select ? (data) => select(data) : undefined
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
    } else if (isError && error) {
      toast.error("Something went wrong while loading data");
    }
  }, [error, isError, onError]);

  return query;
};
