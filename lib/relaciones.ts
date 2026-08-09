/**
 * Supabase devuelve una relación como objeto o como array de un elemento
 * según cómo infiera el tipo la consulta. Esto lo deja siempre en objeto
 * (o null), que es como se usa en las vistas.
 */
export function unoDe<T>(relacion: unknown): T | null {
  if (!relacion) return null;
  if (Array.isArray(relacion)) return (relacion[0] as T) ?? null;
  return relacion as T;
}
