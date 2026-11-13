import { useCallback, useRef, useState } from "react";
import "./App.css";

/* ─── Load all HTML templates as raw strings ─── */
const rawModules = import.meta.glob("./templates/**/*.html", {
    query: "?raw",
    import: "default",
    eager: true,
}) as Record<string, string>;

function formatName(slug: string): string {
    return slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

interface Template {
    id: string;
    filename: string;
    name: string;
    category: string;
    html: string;
}

const templates: Template[] = Object.entries(rawModules).map(([path, html]) => {
    const parts = path.split("/");
    const filename = parts.pop()!;
    const category = parts.pop()!; // folder name = category
    const slug = filename.replace(/\.html$/, "");
    return {
        id: `${category}/${slug}`,
        filename,
        name: formatName(slug),
        category,
        html,
    };
});

type ViewMode = "desktop" | "mobile";

/* ─── Icons ─── */
function EnvelopeIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    );
}

function DesktopIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
        </svg>
    );
}

function MobileIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <path d="M12 18h.01" />
        </svg>
    );
}

function CopyIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

/* ─── App ─── */
export default function App() {
    const [active, setActive] = useState<Template | null>(templates[0] ?? null);
    const [viewMode, setViewMode] = useState<ViewMode>("desktop");
    const [copied, setCopied] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleLoad = useCallback(() => {
        const frame = iframeRef.current;
        if (!frame) return;
        try {
            const doc = frame.contentDocument ?? frame.contentWindow?.document;
            if (doc?.documentElement) {
                frame.style.height = doc.documentElement.scrollHeight + "px";
            }
        } catch {
            frame.style.height = "900px";
        }
    }, []);

    const handleCopy = () => {
        if (!active) return;
        navigator.clipboard.writeText(active.html);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="app">
            {/* ── Sidebar ── */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <span className="brand-name">STEEL</span>
                    </div>
                </div>

                <nav className="template-list">
                    <p className="list-label">
                        Templates &nbsp;·&nbsp; {templates.length}
                    </p>
                    {templates.length === 0 && (
                        <p className="empty-list">No templates found</p>
                    )}
                    {Object.entries(
                        templates.reduce<Record<string, Template[]>>(
                            (acc, t) => {
                                (acc[t.category] ??= []).push(t);
                                return acc;
                            },
                            {},
                        ),
                    ).map(([category, items]) => (
                        <div key={category} className="template-group">
                            <p className="group-label">
                                {formatName(category)}
                            </p>
                            {items.map((t) => (
                                <button
                                    key={t.id}
                                    className={`template-item ${active?.id === t.id ? "active" : ""}`}
                                    onClick={() => {
                                        setActive(t);
                                        setViewMode("desktop");
                                    }}
                                >
                                    <EnvelopeIcon />
                                    <span>{t.name}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* ── Main ── */}
            <div className="main">
                {active ? (
                    <>
                        {/* Top bar */}
                        <div className="topbar">
                            <div className="topbar-left">
                                <span className="topbar-title">
                                    {active.name}
                                </span>
                                <code className="topbar-badge">
                                    {active.filename}
                                </code>
                            </div>
                            <div className="topbar-right">
                                <div className="view-toggle">
                                    <button
                                        className={`toggle-btn ${viewMode === "desktop" ? "on" : ""}`}
                                        onClick={() => setViewMode("desktop")}
                                        title="Desktop view"
                                    >
                                        <DesktopIcon />
                                        <span>Desktop</span>
                                    </button>
                                    <button
                                        className={`toggle-btn ${viewMode === "mobile" ? "on" : ""}`}
                                        onClick={() => setViewMode("mobile")}
                                        title="Mobile view"
                                    >
                                        <MobileIcon />
                                        <span>Mobile</span>
                                    </button>
                                </div>

                                <button
                                    className={`copy-btn ${copied ? "copied" : ""}`}
                                    onClick={handleCopy}
                                >
                                    {copied ? <CheckIcon /> : <CopyIcon />}
                                    {copied ? "Copied!" : "Copy HTML"}
                                </button>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className={`preview-area ${viewMode}`}>
                            <div className="frame-wrap">
                                <iframe
                                    key={active.id}
                                    ref={iframeRef}
                                    srcDoc={active.html}
                                    title={active.name}
                                    className="preview-frame"
                                    onLoad={handleLoad}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="empty-main">
                        <EnvelopeIcon />
                        <p>
                            No templates found in <code>src/templates/</code>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
