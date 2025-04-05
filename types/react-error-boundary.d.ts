declare module "react-error-boundary" {
  import * as React from "react";

  export interface FallbackProps {
    error: Error;
    resetErrorBoundary: (...args: any[]) => void;
  }

  export interface ErrorBoundaryProps {
    fallback:
      | React.ReactElement
      | ((props: FallbackProps) => React.ReactElement);
    onError?: (error: Error, info: { componentStack: string }) => void;
    onReset?: (...args: any[]) => void;
    children?: React.ReactNode;
  }

  export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {}
}
