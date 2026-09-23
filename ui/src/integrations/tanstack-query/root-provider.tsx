import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { env } from "#/env";

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: env.PROD ? 3 : false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: env.PROD ? 3 : false,
        onError: (error) => {
          console.error(error);
          toast.error("An unexpected error occurred. Please try again later.");
        },
      },
    },
  });

  return {
    queryClient,
  };
}
export default function TanstackQueryProvider() {}
