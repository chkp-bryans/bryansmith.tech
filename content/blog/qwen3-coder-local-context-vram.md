---
title: "Qwen3-Coder Locally: The Context Window Math That Actually Matters"
date: "2026-09-12"
excerpt: "Running Qwen3-Coder on a 16 GB GPU is less about the model card and more about one calculation: weights + KV cache + headroom. Here’s how to size context without kneecapping yourself."
tags: "Local AI, LLMs, Qwen3-Coder, Ollama, VRAM, Developer Tools"
cover: "/local-llm-context-window-budget.png"
---

Local models feel free until the GPU starts swapping layers to system RAM. Then you’re not “running AI on your PC”—you’re running a partial model on a graphics card and the rest on a CPU that never asked for the job.

I hit this with **Qwen3-Coder 30B** (MoE, Q4) on a **16 GB** card under Ollama + VS Code Chat. The model card advertises a huge context window. Hardware does not care. **Context length is a memory budget, not a feature checkbox.**

![Local LLM context window budget](/local-llm-context-window-budget.png)

---

## The only formula that matters

Roughly:

```text
VRAM ≈ model_weights + (KV_per_token × num_ctx) + overhead
```

- **Weights** — mostly fixed once you pick size + quantization (Q4_K_M, etc.).
- **KV cache** — grows with **every token** of context you allow (`num_ctx`).
- **Overhead** — OS, browser, IDE, display, other apps.

On a 16 GB card, weights for a ~30B Q4 already eat most of the pie. What’s left is the **context tax**. Push `num_ctx` from 8K → 32K → 64K and you can watch the load tip from “fits on GPU” to “42% CPU / 58% GPU” in `ollama ps`. That split is **layer offload**, not “GPU is half idle.”

High GPU **utilization** while generating (90–100%) can still mean you’re slow—if half the layers live in system RAM.

---

## Qwen3-Coder 30B: what I actually saw

| Setting | What happens |
|---------|----------------|
| **~8K context** | Snappy; comfortable on 16 GB when desktop apps behave |
| **~32K** | Often the sweet spot for Agent-ish work if KV cache is under control |
| **~64K** | VS Code Agent may finally stop 400’ing… while the model balloons (~25 GB footprint) and offloads to CPU |

VS Code Chat/Agent is hungry: tools, open files, history. It wants a **large advertised window**. Your GPU wants a **small KV cache**. Those goals fight each other.

So the “critical calculation” isn’t max context from the model card. It’s:

1. Measure **weight footprint** for your quant.  
2. Decide **usable KV** = VRAM − weights − ~1–2 GB headroom.  
3. Pick the **largest `num_ctx` that keeps layers on GPU** (or accept offload knowingly).  
4. Only then ask whether the IDE is happy.

---

## Levers that move the math (without buying a new GPU)

**1. Shrink the context you allocate**  
Ollama’s Context length / `num_ctx` is real memory reservation. Start at **8K–16K** for Ask mode; climb only until Agent stops failing.

**2. Quantize the KV cache**  
With Flash Attention, `OLLAMA_KV_CACHE_TYPE=q8_0` roughly **halves** KV VRAM vs default f16 (small quality hit). `q4_0` is ~¼—more aggressive. This is the biggest free win if you need 32K–64K for the IDE.

**3. Don’t multiply slots**  
`OLLAMA_NUM_PARALLEL=1` so you aren’t paying for concurrent KV arenas you aren’t using.

**4. Two-model workflow**  
- **Agent / tool loops:** smaller coder (~7–14B) with larger context that still fits.  
- **Hard coding Ask:** Qwen3-Coder 30B with a tighter window.  
Same machine, different jobs.

**5. Compact or start new chats**  
Agent history is silent VRAM. `/compact` or a fresh session is a performance feature.

---

## A practical sizing checklist

1. Load the model with your intended `num_ctx`.  
2. Run `ollama ps` — note **SIZE**, **CONTEXT**, **PROCESSOR** (CPU/GPU %).  
3. If GPU share drops and SIZE exceeds VRAM, **context (or KV precision) is the problem**, not “the model is bad.”  
4. Prefer **full GPU + smaller window** over **huge window + CPU offload** unless Agent truly needs the room.  
5. Re-check after enabling **KV q8_0**—you may reclaim enough budget to raise context without offload.

---

## Bottom line

Qwen3-Coder is strong locally. The failure mode isn’t intelligence—it’s **mis-sizing the context budget**. Treat `num_ctx` like a capacity plan: weights first, KV second, IDE last. Get that order right and local AI stays fast. Get it wrong and you’ll swear the GPU is “at 98%” while half the model jogs on the CPU.
