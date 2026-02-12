# soulsofpixels

A tiny Python project that generates deterministic, symmetric pixel avatars ("souls") from text seeds.

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
soulsofpixels "my-seed"
```

## Example output

```text
Soul 'my-seed' has a curious aura.

██  ████  ██
  ██████████
██████  ████
██  ████████
  ██████████
████  ██  ██
██  ████████
████████████
  ████  ████
```

## Development

Run tests:

```bash
pytest
```
