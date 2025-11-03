
// Global type declarations for error handling

declare global {
  let __promiseRejectionTrackingInstalled: boolean | undefined;
  
  interface Window {
    __promiseRejectionTrackingInstalled?: boolean;
  }

  interface ErrorUtils {
    setGlobalHandler: (handler: (error: any, isFatal?: boolean) => void) => void;
    getGlobalHandler: () => ((error: any, isFatal?: boolean) => void) | undefined;
  }

  let ErrorUtils: ErrorUtils | undefined;

  interface HermesInternal {
    enablePromiseRejectionTracker?: (options: {
      allRejections: Map<Promise<any>, any>;
      onUnhandled: (id: any, error: any) => void;
      onHandled: (id: any) => void;
    }) => void;
  }

  let HermesInternal: HermesInternal | undefined;
}

export {};
