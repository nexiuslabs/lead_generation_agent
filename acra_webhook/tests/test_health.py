import importlib


def test_health_main(monkeypatch):
    # Provide minimal env so module import does not fail
    monkeypatch.setenv("DATABASE_URL", "sqlite://")
    monkeypatch.setenv("API_URL", "https://example.com")
    monkeypatch.setenv("RESOURCE_ID", "dummy")

    import main  # noqa: F401
    importlib.reload(main)

    assert main.health_check() == {"status": "ok"}


def test_health_schedule(monkeypatch):
    # Provide minimal env so module import does not fail
    monkeypatch.setenv("DATABASE_URL", "sqlite://")
    monkeypatch.setenv("API_URL", "https://example.com")
    monkeypatch.setenv("RESOURCE_ID", "dummy")

    import schedule  # noqa: F401
    importlib.reload(schedule)

    assert schedule.health_check() == {"status": "ok"}

