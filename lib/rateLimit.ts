import { CONFIG } from "./config";

/**
 * Límite por gerente, en memoria del proceso.
 *
 * Suficiente para el volumen real (unas decenas de gerentes): evita que un
 * bucle accidental dispare la factura de la API. No es un límite distribuido
 * — si algún día hay varias instancias, moverlo a la base de datos.
 */
const registro = new Map<string, number[]>();
const VENTANA_MS = 60 * 60 * 1000; // 1 hora

export function superaLimite(gerenteId: string): boolean {
  const ahora = Date.now();
  const previos = (registro.get(gerenteId) ?? []).filter(
    (t) => ahora - t < VENTANA_MS,
  );

  if (previos.length >= CONFIG.limites.mensajesPorHora) {
    registro.set(gerenteId, previos);
    return true;
  }

  previos.push(ahora);
  registro.set(gerenteId, previos);

  // Limpieza perezosa para que el Map no crezca sin fin.
  if (registro.size > 500) {
    for (const [clave, marcas] of registro) {
      if (marcas.every((t) => ahora - t >= VENTANA_MS)) registro.delete(clave);
    }
  }

  return false;
}
