(function () {
  if (typeof mermaid === "undefined") return;

  mermaid.initialize({
    startOnLoad: false,
    // Required so click "..." GitHub handlers from GitDiagram mermaid work.
    securityLevel: "loose",
    theme: "default",
    flowchart: {
      htmlLabels: true,
      curve: "basis"
    }
  });

  function promoteMermaidBlocks() {
    document.querySelectorAll("pre > code.language-mermaid").forEach((code) => {
      const pre = code.parentElement;
      if (!pre) return;
      const div = document.createElement("div");
      div.className = "mermaid";
      div.textContent = code.textContent || "";
      pre.replaceWith(div);
    });
  }

  function run() {
    promoteMermaidBlocks();
    const nodes = document.querySelectorAll(".mermaid");
    if (!nodes.length) return;
    mermaid.run({ nodes: Array.from(nodes) }).catch((err) => {
      console.warn("Mermaid render failed", err);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
