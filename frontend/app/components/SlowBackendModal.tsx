"use client";

import { useEffect, useState } from "react";
import Modal from "@/app/dashboard/profile/components/Modal";
import { subscribeSlowRequest } from "@/lib/api/slowRequest";

type SlowState = {
  visible: boolean;
  pendingCount: number;
  message: string;
};

export default function SlowBackendModal() {
  const [state, setState] = useState<SlowState>({
    visible: false,
    pendingCount: 0,
    message: "",
  });

  useEffect(() => {
    return subscribeSlowRequest(setState);
  }, []);

  return (
    <Modal
      isOpen={state.visible}
      onClose={() => {
        setState((s) => ({ ...s, visible: false }));
      }}
      title="Backend waking up"
    >
      <div className="space-y-4">
        <p className="text-[#25324B] leading-relaxed">{state.message}</p>
        <div className="rounded-xl bg-[#F8F8FD] p-4">
          <p className="text-sm text-[#25324B]">
            Pending requests:{" "}
            <span className="font-semibold">{state.pendingCount}</span>
          </p>
        </div>
        <div className="flex justify-end">
          <button
            className="px-4 py-2 rounded-lg bg-[#25324B] text-white disabled:opacity-50"
            onClick={() => setState((s) => ({ ...s, visible: false }))}
          >
            Ok
          </button>
        </div>
      </div>
    </Modal>
  );
}
