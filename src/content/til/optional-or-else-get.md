---
title: 'Optional: orElse() vs. orElseGet()'
description: 'The fallback in orElse() is evaluated even when a value is present.'
pubDate: 2026-10-22
tags: [Java]
draft: true
sample: true
---

`orElse()` receives an already evaluated value. `orElseGet()` receives a supplier, which runs only when the Optional is empty.

```java
value.orElse(loadDefault());
value.orElseGet(() -> loadDefault());
```

Use a supplier when creating the fallback is expensive or has side effects. For a simple constant, `orElse()` is usually clear enough.
