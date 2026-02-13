"""Core pixel soul generation utilities."""

from __future__ import annotations

from dataclasses import dataclass
import hashlib
import random


@dataclass(frozen=True)
class PixelSoul:
    """A tiny symmetric pixel avatar with a short lore string."""

    seed: str
    size: int
    pixels: tuple[tuple[bool, ...], ...]
    mood: str


def _seed_to_int(seed: str) -> int:
    digest = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return int(digest[:16], 16)


def generate_pixel_soul(seed: str, size: int = 9) -> PixelSoul:
    """Generate a deterministic pixel soul from a text seed."""
    if not seed.strip():
        raise ValueError("seed must not be empty")
    if size < 5 or size % 2 == 0:
        raise ValueError("size must be odd and at least 5")

    rng = random.Random(_seed_to_int(seed))
    half = (size + 1) // 2
    rows: list[tuple[bool, ...]] = []

    for _ in range(size):
        left_half = [rng.random() > 0.45 for _ in range(half)]
        mirrored = left_half + left_half[-2::-1]
        rows.append(tuple(mirrored))

    moods = ["radiant", "ancient", "curious", "feral", "serene", "stormbound"]
    mood = moods[_seed_to_int(seed[::-1]) % len(moods)]
    return PixelSoul(seed=seed, size=size, pixels=tuple(rows), mood=mood)


def render_pixel_soul(soul: PixelSoul, on: str = "██", off: str = "  ") -> str:
    """Render the soul into terminal-friendly block text."""
    lines = []
    for row in soul.pixels:
        lines.append("".join(on if bit else off for bit in row))
    return "\n".join(lines)
