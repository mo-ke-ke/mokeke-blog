"use client";

import * as React from "react";
import { useEffect, useId, useMemo, useState } from "react";
import { useTheme } from "next-themes";

type SpecialLanguage = "mermaid" | "thinking" | "stream";

interface MermaidRenderResult {
  svg: string;
}

interface MermaidApi {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, code: string) => Promise<MermaidRenderResult>;
}

declare global {
  interface Window {
    mermaid?: MermaidApi;
    __mermaidLoader__?: Promise<MermaidApi>;
  }
}

interface SpecialBlockInfo {
  kind: SpecialLanguage;
  language: string;
  title?: string;
  code: string;
}

interface SpecialBlockProps {
  code: string;
  title?: string;
}

interface StreamField {
  name: string;
  value: string;
}

interface StreamFrame {
  fields: StreamField[];
}

const MERMAID_CDN_URL = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
const MERMAID_LANGUAGES = new Set(["mermaid", "mmd"]);
const THINKING_LANGUAGES = new Set(["thinking", "reasoning", "think"]);
const STREAM_LANGUAGES = new Set([
  "stream",
  "sse",
  "event-stream",
  "server-sent-events",
  "stream-protocol",
  "eventsource",
  "text-event-stream",
]);

function normalizeLanguage(value: unknown): string {
  return typeof value === "string" ? value.toLowerCase().trim() : "";
}

function resolveSpecialLanguage(language: string): SpecialLanguage | null {
  if (MERMAID_LANGUAGES.has(language)) {
    return "mermaid";
  }

  if (THINKING_LANGUAGES.has(language)) {
    return "thinking";
  }

  if (STREAM_LANGUAGES.has(language)) {
    return "stream";
  }

  return null;
}

function isElement(node: React.ReactNode): node is React.ReactElement<Record<string, unknown>> {
  return React.isValidElement(node);
}

function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") {
    return "";
  }

  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }

  if (isElement(node)) {
    return extractText(node.props.children as React.ReactNode);
  }

  return "";
}

function findFirstChildByTag(
  children: React.ReactNode,
  tagName: string,
): React.ReactElement<Record<string, unknown>> | null {
  for (const child of React.Children.toArray(children)) {
    if (isElement(child) && child.type === tagName) {
      return child;
    }
  }

  return null;
}

function getLanguageFromPre(pre: React.ReactElement<Record<string, unknown>>): string {
  const directLanguage = normalizeLanguage(pre.props["data-language"]);
  if (directLanguage) {
    return directLanguage;
  }

  const codeNode = findFirstChildByTag(pre.props.children as React.ReactNode, "code");
  if (!codeNode) {
    return "";
  }

  return normalizeLanguage(codeNode.props["data-language"]);
}

function extractCodeFromPre(pre: React.ReactElement<Record<string, unknown>>): string {
  return extractText(pre.props.children as React.ReactNode)
    .replace(/\u00a0/g, " ")
    .replace(/\n$/, "");
}

function extractSpecialBlock(children: React.ReactNode): SpecialBlockInfo | null {
  const pre = findFirstChildByTag(children, "pre");
  if (!pre) {
    return null;
  }

  const language = getLanguageFromPre(pre);
  const kind = resolveSpecialLanguage(language);
  if (!kind) {
    return null;
  }

  const figcaption = findFirstChildByTag(children, "figcaption");
  const title = figcaption ? extractText(figcaption.props.children as React.ReactNode).trim() : undefined;
  const code = extractCodeFromPre(pre).trimEnd();

  return {
    kind,
    language,
    title: title || undefined,
    code,
  };
}

function loadMermaid(): Promise<MermaidApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Mermaid can only load in the browser."));
  }

  if (window.mermaid) {
    return Promise.resolve(window.mermaid);
  }

  if (!window.__mermaidLoader__) {
    window.__mermaidLoader__ = new Promise<MermaidApi>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${MERMAID_CDN_URL}"]`);

      const resolveIfReady = () => {
        if (window.mermaid) {
          resolve(window.mermaid);
          return true;
        }

        return false;
      };

      const handleLoad = () => {
        if (resolveIfReady()) {
          return;
        }

        delete window.__mermaidLoader__;
        reject(new Error("Mermaid script loaded, but window.mermaid is unavailable."));
      };

      const handleError = () => {
        delete window.__mermaidLoader__;
        reject(new Error("Failed to load mermaid.js from CDN."));
      };

      if (existingScript) {
        if (resolveIfReady()) {
          return;
        }

        existingScript.addEventListener("load", handleLoad, { once: true });
        existingScript.addEventListener("error", handleError, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = MERMAID_CDN_URL;
      script.async = true;
      script.dataset.mermaid = "true";
      script.addEventListener(
        "load",
        () => {
          script.dataset.loaded = "true";
          handleLoad();
        },
        { once: true },
      );
      script.addEventListener("error", handleError, { once: true });
      document.head.appendChild(script);
    });
  }

  return window.__mermaidLoader__;
}

function normalizeThinking(code: string): string {
  return code.trim().replace(/^<think>\s*/i, "").replace(/\s*<\/think>$/i, "");
}

function parseStreamFrames(code: string): StreamFrame[] {
  const frames = code
    .trim()
    .split(/\n\s*\n/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const fields = chunk
        .split("\n")
        .map((line) => line.trimEnd())
        .filter(Boolean)
        .map<StreamField>((line) => {
          if (line.startsWith(":")) {
            return { name: "comment", value: line.slice(1).trim() };
          }

          const separatorIndex = line.indexOf(":");
          if (separatorIndex === -1) {
            return { name: line.trim() || "data", value: "" };
          }

          return {
            name: line.slice(0, separatorIndex).trim() || "data",
            value: line.slice(separatorIndex + 1).replace(/^\s/, ""),
          };
        });

      return { fields };
    })
    .filter((frame) => frame.fields.length > 0);

  if (frames.length > 0) {
    return frames;
  }

  const fallback = code.trim();
  return fallback ? [{ fields: [{ name: "data", value: fallback }] }] : [];
}

function formatMaybeJson(value: string): string | null {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return null;
  }
}

function getFieldTone(name: string): string {
  switch (name) {
    case "event":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-300";
    case "data":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "id":
      return "bg-violet-500/10 text-violet-700 dark:text-violet-300";
    case "retry":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "comment":
      return "bg-slate-500/10 text-slate-700 dark:text-slate-300";
    default:
      return "bg-slate-500/10 text-slate-700 dark:text-slate-300";
  }
}

function MermaidBlock({ code, title }: SpecialBlockProps) {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const graphId = useId().replace(/:/g, "-");

  useEffect(() => {
    let cancelled = false;

    const renderDiagram = async () => {
      try {
        const mermaid = await loadMermaid();
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: resolvedTheme === "dark" ? "dark" : "default",
          fontFamily: "var(--font-sans), sans-serif",
        });

        const result = await mermaid.render(`mermaid-${graphId}`, code);
        if (cancelled) {
          return;
        }

        setSvg(result.svg);
        setError("");
      } catch (nextError) {
        if (cancelled) {
          return;
        }

        setSvg("");
        setError(nextError instanceof Error ? nextError.message : "Failed to render mermaid diagram.");
      }
    };

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [code, graphId, resolvedTheme]);

  return (
    <section className="my-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-300">
            Mermaid
          </span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-100">
            {title || "自动渲染图表"}
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {resolvedTheme === "dark" ? "dark" : "light"}
        </span>
      </header>

      <div className="px-4 py-5">
        {error ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">Mermaid 渲染失败：{error}</p>
            <div className="overflow-x-auto rounded-xl bg-slate-950 px-4 py-3 font-mono text-xs leading-6 text-slate-100">
              <pre>{code}</pre>
            </div>
          </div>
        ) : svg ? (
          <div
            className="overflow-x-auto rounded-xl bg-slate-50 px-3 py-4 dark:bg-slate-900/70 [&_svg]:mx-auto [&_svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">正在渲染 Mermaid 图表...</p>
        )}
      </div>
    </section>
  );
}

function ThinkingBlock({ code, title }: SpecialBlockProps) {
  const sections = useMemo(() => {
    const normalized = normalizeThinking(code);
    return normalized.split(/\n\s*\n/g).map((section) => section.trim()).filter(Boolean);
  }, [code]);

  return (
    <section className="my-6 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/60 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/20">
      <header className="flex flex-wrap items-center gap-3 border-b border-amber-200 px-4 py-3 dark:border-amber-900/60">
        <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-amber-700 dark:text-amber-300">
          Thinking
        </span>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-100">
          {title || "思考过程 / reasoning trace"}
        </span>
      </header>

      <div className="space-y-3 px-4 py-5">
        {sections.length > 0 ? (
          sections.map((section, index) => (
            <div
              key={`${index}-${section.slice(0, 24)}`}
              className="rounded-xl border border-amber-200/80 bg-white/80 p-4 dark:border-amber-900/50 dark:bg-slate-950/50"
            >
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
                step {String(index + 1).padStart(2, "0")}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">
                {section}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">没有可展示的 thinking 内容。</p>
        )}
      </div>
    </section>
  );
}

function StreamProtocolBlock({ code, title }: SpecialBlockProps) {
  const frames = useMemo(() => parseStreamFrames(code), [code]);

  return (
    <section className="my-6 overflow-hidden rounded-2xl border border-sky-200 bg-sky-50/50 shadow-sm dark:border-sky-900/60 dark:bg-sky-950/15">
      <header className="flex flex-wrap items-center gap-3 border-b border-sky-200 px-4 py-3 dark:border-sky-900/60">
        <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-sky-700 dark:text-sky-300">
          Stream
        </span>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-100">
          {title || "流式协议 / SSE 展示"}
        </span>
      </header>

      <div className="space-y-4 px-4 py-5">
        {frames.length > 0 ? (
          frames.map((frame, frameIndex) => (
            <div
              key={`frame-${frameIndex}`}
              className="rounded-xl border border-sky-200/80 bg-white/80 p-4 dark:border-sky-900/50 dark:bg-slate-950/50"
            >
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
                chunk {String(frameIndex + 1).padStart(2, "0")}
              </div>
              <div className="space-y-3">
                {frame.fields.map((field, fieldIndex) => {
                  const prettyJson = field.name === "data" ? formatMaybeJson(field.value) : null;

                  return (
                    <div
                      key={`${field.name}-${fieldIndex}`}
                      className="grid gap-2 md:grid-cols-[92px_minmax(0,1fr)] md:items-start"
                    >
                      <span
                        className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${getFieldTone(field.name)}`}
                      >
                        {field.name}
                      </span>
                      {prettyJson ? (
                        <pre className="overflow-x-auto rounded-lg bg-slate-950 px-3 py-2 text-xs leading-6 text-slate-100">
                          {prettyJson}
                        </pre>
                      ) : (
                        <code className="block overflow-x-auto rounded-lg bg-slate-950 px-3 py-2 text-xs leading-6 text-slate-100">
                          {field.value || "(empty)"}
                        </code>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">没有可展示的流式协议内容。</p>
        )}
      </div>
    </section>
  );
}

export function MdxFigure(props: React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>) {
  const specialBlock = extractSpecialBlock(props.children);

  if (!specialBlock) {
    return <figure {...props} />;
  }

  if (specialBlock.kind === "mermaid") {
    return <MermaidBlock code={specialBlock.code} title={specialBlock.title} />;
  }

  if (specialBlock.kind === "thinking") {
    return <ThinkingBlock code={specialBlock.code} title={specialBlock.title} />;
  }

  return <StreamProtocolBlock code={specialBlock.code} title={specialBlock.title} />;
}
