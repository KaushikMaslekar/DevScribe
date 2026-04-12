# Module 05: Rich Editor and Markdown Pipeline

## Goal

Deliver a writing experience centered on TipTap while preserving markdown compatibility for storage and rendering.

## Status

Completed.

## Implementation Summary

- TipTap editor is integrated in the dashboard writing workflow.
- Required formatting features are implemented: headings, bold, italic, lists, code blocks, and links.
- Live preview pipeline is implemented in the editor with markdown conversion.
- Markdown persistence contract is implemented using posts.markdown_content.
- Editor is lazy loaded on dashboard to avoid initial bundle inflation.
- Save/load roundtrip is active through markdown conversion boundaries.

## Core Scope

- TipTap editor integration in writing workflow.
- Feature set: headings, bold, italic, code blocks, lists, links.
- Live preview pipeline.
- Stable markdown persistence contract with backend.

## Frontend Architecture

- Editor state held in React component state.
- TipTap extensions configured for required formatting primitives.
- Optional syntax highlighting extension for code blocks.
- Editor chunk loaded lazily to avoid initial bundle inflation.

## Data Contract Strategy

- In-editor state remains TipTap/JSON for rich interactions.
- Persisted format remains markdown (backend canonical contract).
- Conversion boundaries explicitly defined before save/load.

## How It Works

1. User edits in TipTap.
2. On change, editor updates local state.
3. Save workflow converts state to markdown payload.
4. Backend stores markdown in `posts.markdown_content`.
5. Read flows return markdown for preview/detail rendering.

## UX Expectations

- Keyboard-friendly editing.
- Clean block spacing and code readability.
- Non-blocking save states and clear draft feedback.

## Validation Targets

- Formatting operations survive save/load cycles.
- Markdown output is deterministic.
- Editor remains responsive on long content.
