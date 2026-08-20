"use client";

export type ChatMessageType = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed rounded-2xl ${
          isUser
            ? "bg-[#087F5B] text-white rounded-br-md"
            : "bg-white text-[#25324B] border border-gray-100 shadow-sm rounded-bl-md"
        }`}
      >
        {!isUser && (
          <p className="text-[10px] font-semibold text-[#087F5B] mb-1">HireLens AI</p>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
