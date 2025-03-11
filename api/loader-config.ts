import { useCallback, useEffect, useMemo, useState } from "react";
import api from "./api";

export const GlobalLoaderConfig = () => {
  const [counter, setCounter] = useState<number>(0);

  const inc = useCallback(() => setCounter((counter: number) => counter + 1), [
    setCounter
  ]); // add to counter
  const dec = useCallback(() => setCounter((counter: number) => counter - 1), [
    setCounter
  ]); // remove from counter

  const interceptors: any = useMemo(
    () => ({
      request: (config: any) => {
        inc();
        return config;
      },
      response: (response: any) => {
        dec();
        return response;
      },
      error: (error: Error) => {
        dec();
        return Promise.reject(error);
      }
    }),
    [inc, dec]
  ); // create the interceptors

  useEffect(() => {
    // add request interceptors
    api.interceptors.request.use(interceptors.request, interceptors.error);
    // add response interceptors
    api.interceptors.response.use(interceptors.response, interceptors.error);
    return () => {
      // remove all intercepts when done
      api.interceptors.request.eject(interceptors.request);
      api.interceptors.request.eject(interceptors.error);
      api.interceptors.response.eject(interceptors.response);
      api.interceptors.response.eject(interceptors.error);
    };
  }, [interceptors]);

  return [counter > 0];
};