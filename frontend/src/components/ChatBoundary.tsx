import { Component, type ReactNode } from 'react';

/** If the chat widget ever throws, hide it instead of blanking the whole site. */
export class ChatBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error('chat widget crashed:', error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
