---
title: 'Designing a small Java API'
description: 'A starter article on clear contracts, useful defaults, and keeping an API easy to understand.'
pubDate: 2026-10-22
tags: [Java]
draft: true
sample: true
---

A small API is an opportunity to make the everyday path easy to follow. Start with what the caller needs to do, then choose the smallest interface that expresses it clearly.

## Make the contract visible

Use names and types to explain required inputs and possible outcomes. Decide how missing values and invalid requests behave before adding more endpoints.

```java
public interface BookCatalog {
    Optional<Book> findById(BookId id);
}
```

## Start with one complete path

Implement a single useful request from input validation through persistence and response. The complete path exposes awkward boundaries earlier than a collection of disconnected classes.

## Leave room to learn

A clear interface can evolve. Keep implementation choices behind it, and let real usage guide the next abstraction.
