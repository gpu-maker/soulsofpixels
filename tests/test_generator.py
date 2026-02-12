from soulsofpixels.generator import generate_pixel_soul, render_pixel_soul


def test_generation_is_deterministic() -> None:
    one = generate_pixel_soul("ember")
    two = generate_pixel_soul("ember")
    assert one == two


def test_grid_is_symmetric() -> None:
    soul = generate_pixel_soul("mirror", size=7)
    for row in soul.pixels:
        assert row == row[::-1]


def test_render_shape() -> None:
    soul = generate_pixel_soul("shape", size=5)
    rendered = render_pixel_soul(soul, on="#", off=".")
    lines = rendered.splitlines()
    assert len(lines) == 5
    assert all(len(line) == 5 for line in lines)
