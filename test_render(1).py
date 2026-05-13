"""
Tests automáticos para la app de alumnos desplegada en Render.
Uso:
    pip install pytest requests
    pytest test_render.py -v
"""
import time
import pytest
import requests

# ── Cambia estas URLs por las tuyas ──────────────────────────
URL_PRE = "https://hola-render-pre-id8t.onrender.com"
URL_PRO = "https://hola-render-pro-g2vn.onrender.com"
# ─────────────────────────────────────────────────────────────

TEXTO_TABLA  = "Lista de Alumnos"
TEXTO_ALUMNO = "Maldonado"          # Texto que debe aparecer si la BD tiene datos


@pytest.fixture(params=[URL_PRE, URL_PRO], ids=["PRE", "PRO"])
def url(request):
    return request.param


# ── Tests principales ────────────────────────────────────────

def test_estado_http_200(url):
    """La página responde con HTTP 200."""
    r = requests.get(url, timeout=15)
    assert r.status_code == 200, f"Esperado 200, recibido {r.status_code}"


def test_contiene_tabla_alumnos(url):
    """La página contiene el título 'Lista de Alumnos'."""
    r = requests.get(url, timeout=15)
    assert TEXTO_TABLA in r.text, f"No se encontró '{TEXTO_TABLA}' en la respuesta"


def test_contiene_datos_bd(url):
    """La página muestra datos de la base de datos (al menos un alumno)."""
    r = requests.get(url, timeout=15)
    assert TEXTO_ALUMNO in r.text, (
        f"No se encontró '{TEXTO_ALUMNO}'. ¿Está la BD inicializada con init_db.sql?"
    )


def test_tiempo_de_respuesta(url):
    """El tiempo de respuesta es menor de 5 segundos."""
    inicio = time.time()
    requests.get(url, timeout=15)
    duracion = time.time() - inicio
    assert duracion < 5, f"Tardó {duracion:.2f}s (límite: 5s)"


def test_content_type_es_html(url):
    """La cabecera Content-Type indica HTML."""
    r = requests.get(url, timeout=15)
    assert "text/html" in r.headers.get("Content-Type", ""), (
        f"Content-Type inesperado: {r.headers.get('Content-Type')}"
    )


def test_health_endpoint(url):
    """El endpoint /health responde con JSON status ok."""
    r = requests.get(f"{url}/health", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
