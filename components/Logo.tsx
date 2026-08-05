/**
 * Logo real de Loke.
 * Fuente: projects/2026-07-10-radar-loke-web/src/logo-icon.svg
 * Los dos colores son los de marca (#ff4713 naranja, #2d2a26 oscuro):
 * nunca sustituirlos por blanco para "que se vea" sobre un fondo oscuro —
 * si hiciera falta eso, el fondo está mal.
 */
export function Logo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 322 311"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M422,407.35c.14,2.37.23,4.75.23,7.16a122.57,122.57,0,0,1-33.47,84,106.7,106.7,0,0,0-177.87,0,122.52,122.52,0,0,1-33.47-84c0-2.41.09-4.79.23-7.16H136.74c-.1,2.38-.18,4.76-.18,7.16A163.52,163.52,0,0,0,205.93,548l21,13.27c.69-39.69,33-70.16,72.89-70.16s72.2,30.47,72.89,70.16l21-13.27a163.52,163.52,0,0,0,69.37-133.51c0-2.4-.08-4.78-.18-7.16Z"
        transform="translate(-136.56 -251.27)"
        fill="#ff4713"
      />
      <path
        d="M346.61,383.44a46.81,46.81,0,1,0-46.81,46.81,46.81,46.81,0,0,0,46.81-46.81"
        transform="translate(-136.56 -251.27)"
        fill="#ff4713"
      />
      <path
        d="M190.49,359.54a122.32,122.32,0,0,1,218.63,0H453.5c-22.62-63.05-83-108.27-153.7-108.27S168.73,296.49,146.11,359.54Z"
        transform="translate(-136.56 -251.27)"
        fill="#2d2a26"
      />
    </svg>
  );
}

/** Marca completa: icono + nombre. Membrete siempre claro (regla de marca). */
export function Marca({ subtitulo }: { subtitulo?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Logo className="h-7 w-auto shrink-0" />
      <div className="leading-tight">
        <div className="text-[15px] font-bold text-dark">Loke</div>
        <div className="text-[11px] text-gray">
          {subtitulo ?? "Trabajo Social y Talento"}
        </div>
      </div>
    </div>
  );
}
