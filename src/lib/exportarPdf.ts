/** Abre el diálogo de impresión para guardar como PDF (sin librerías externas) */
export function descargarComoPdf(
  titulo: string,
  contenidoHtml: string
) {
  const ventana = window.open('', '_blank')
  if (!ventana) {
    alert('Permití las ventanas emergentes para descargar el PDF.')
    return
  }
  ventana.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${titulo}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 24px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 1.5rem; margin-bottom: 8px; }
        .fecha { color: #666; font-size: 0.875rem; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e5e5; }
        th { background: #f5f5f5; font-weight: 600; }
        .total { font-weight: 700; font-size: 1.125rem; }
        .positivo { color: #059669; }
        .negativo { color: #dc2626; }
        .section { margin-bottom: 24px; }
        .section h2 { font-size: 1rem; margin-bottom: 12px; color: #444; }
        @media print { body { padding: 16px; } }
      </style>
    </head>
    <body>
      ${contenidoHtml}
    </body>
    </html>
  `)
  ventana.document.close()
  ventana.focus()
  setTimeout(() => {
    ventana.print()
    ventana.close()
  }, 250)
}
