type SlowRequestState = {
  visible: boolean;
  pendingCount: number;
  message: string;
};

type Listener = (state: SlowRequestState) => void;

const listeners = new Set<Listener>();

let pendingCount = 0;
let visible = false;
let timer: ReturnType<typeof setTimeout> | null = null;

const DEFAULT_THRESHOLD_MS = 6000;

function emit(message?: string) {
  const state: SlowRequestState = {
    visible,
    pendingCount,
    message:
      message ??
      "This request is taking longer because the backend is hosted on Render free plan and may be waking up (cold start). Please wait a moment.",
  };

  for (const l of listeners) l(state);
}

export function subscribeSlowRequest(listener: Listener) {
  listeners.add(listener);

  listener({
    visible,
    pendingCount,
    message:
      "This request is taking longer because the backend is hosted on Render free plan and may be waking up (cold start). Please wait a moment.",
  });

  return () => {
    listeners.delete(listener);
  };
}

export function notifyRequestStarted(thresholdMs?: number) {
  pendingCount += 1;

  if (!timer) {
    const ms =
      typeof thresholdMs === "number" && Number.isFinite(thresholdMs)
        ? Math.max(0, thresholdMs)
        : DEFAULT_THRESHOLD_MS;

    timer = setTimeout(() => {
      if (pendingCount > 0) {
        visible = true;
        emit();
      }
    }, ms);
  }

  emit();
}

export function notifyRequestFinished() {
  pendingCount = Math.max(0, pendingCount - 1);

  if (pendingCount === 0) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (visible) {
      visible = false;
    }
  }

  emit();
}
