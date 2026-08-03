import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {}
  render() {
    if (this.state.hasError)
      return (
        <main className="error-state">
          <h1>Something went wrong</h1>
          <p>Please refresh the page and try again.</p>
          <button onClick={() => this.setState({ hasError: false })}>Try again</button>
        </main>
      );
    return this.props.children;
  }
}
