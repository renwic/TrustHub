import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Overloaded function signatures for backward compatibility
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown,
): Promise<Response>;
export async function apiRequest(
  url: string,
  options?: RequestInit,
): Promise<Response>;
export async function apiRequest(
  methodOrUrl: string,
  urlOrOptions?: string | RequestInit,
  data?: unknown,
): Promise<Response> {
  let url: string;
  let options: RequestInit;

  // Determine if this is the old (method, url, data) or new (url, options) signature
  if (typeof urlOrOptions === 'string') {
    // Old signature: (method, url, data)
    const method = methodOrUrl;
    url = urlOrOptions;
    const authToken = localStorage.getItem('authToken');
    const authHeaders = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
    
    options = {
      method,
      headers: { 
        ...(data ? { "Content-Type": "application/json" } : {}),
        ...authHeaders,
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    };
  } else {
    // New signature: (url, options)
    url = methodOrUrl;
    const authToken = localStorage.getItem('authToken');
    const authHeaders = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
    
    options = {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...(urlOrOptions?.headers || {}),
      },
      credentials: "include",
      ...(urlOrOptions || {}),
    };
  }

  const res = await fetch(url, options);
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const authToken = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
