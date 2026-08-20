declare module "nprogress" {
  function start(): void;
  function done(force?: boolean): void;
  function configure(options: {
    minimum?: number;
    easing?: string;
    positionUsing?: string;
    speed?: number;
    trickle?: boolean;
    trickleRate?: number;
    trickleSpeed?: number;
    showSpinner?: boolean;
    barSelector?: string;
    spinnerSelector?: string;
    parent?: string;
    template?: string;
  }): void;
  function set(n: number): void;
  function inc(amount?: number): void;
  function remove(): void;
  function status(): number | null;

  export default {
    start,
    done,
    configure,
    set,
    inc,
    remove,
    status,
  };
}
