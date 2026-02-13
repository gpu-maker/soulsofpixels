"""Command-line interface for generating pixel souls."""

from __future__ import annotations

import argparse

from .generator import generate_pixel_soul, render_pixel_soul


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate deterministic pixel souls")
    parser.add_argument("seed", help="seed phrase for the generated soul")
    parser.add_argument("--size", type=int, default=9, help="odd size >= 5 (default: 9)")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    soul = generate_pixel_soul(args.seed, size=args.size)
    print(f"Soul '{args.seed}' has a {soul.mood} aura.\n")
    print(render_pixel_soul(soul))


if __name__ == "__main__":
    main()
