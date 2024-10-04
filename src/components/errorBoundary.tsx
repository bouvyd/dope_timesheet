import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="inset-0 fixed bg-white flex flex-col gap-3 items-center justify-center text-red p-3">
          <h1 className="font-caveat text-3xl font-bold">Oops</h1>
          <span className="font-caveat text-xl">Something went wrong</span>
          <p className="text-gray-500">Damnn, and I thought this extension was dope...</p>
          <pre className="text-red-500 w-full overflow-auto">{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;