import { Component, ReactNode } from 'react';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

export class PlayerErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // Surface in console but don't crash the app.
    console.warn('[PlayerErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="w-full bg-black/70 text-white text-xs p-3 rounded-lg">
            Player temporarily unavailable. Try again.
          </div>
        )
      );
    }
    return this.props.children;
  }
}
