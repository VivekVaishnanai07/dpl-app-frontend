import { useCallback, useEffect, useMemo, useState } from "react";
import api from "./api";

export const useGlobalLoader = () => {
  const [counter, setCounter] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const inc = useCallback(() => setCounter((c) => c + 1), []);
  const dec = useCallback(() => setCounter((c) => Math.max(0, c - 1)), []);

  const interceptors = useMemo(() => {
    return {
      request: (config: any) => {
        inc();
        return config;
      },
      response: (response: any) => {
        dec();
        return response;
      },
      error: (error: any) => {
        dec();
        return Promise.reject(error);
      }
    };
  }, [inc, dec]);

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      interceptors.request,
      interceptors.error
    );
    const responseInterceptor = api.interceptors.response.use(
      interceptors.response,
      interceptors.error
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [interceptors]);

  // **Delay before showing the loader**
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (counter > 0) {
      timer = setTimeout(() => {
        setIsLoading(true);
      }, 500);
    } else {
      setIsLoading(false);
    }

    return () => clearTimeout(timer);
  }, [counter]);

  return isLoading;
};
