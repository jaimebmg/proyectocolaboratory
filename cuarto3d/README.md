# Cuarto 3D editable

Modelo 3D aproximado del cuarto (medidas estimadas a partir de fotos), con editor incluido. El selector de la barra cambia entre dos diseños: el cuarto actual y la propuesta de habitación Montessori para Joaquín; cada uno guarda sus cambios por separado.

- **Abrir:** `index.html` en cualquier navegador (no necesita internet ni servidor).
- **Editar:** clic en un objeto → mover / rotar / escalar con el gizmo o con los campos numéricos; cambiar colores, duplicar, eliminar o agregar cajas, cilindros y esferas. Los cambios se guardan solos en el navegador.
- **Exportar:** `Guardar JSON` (se puede reabrir aquí) o `Exportar GLB` (Blender, SketchUp, visores 3D).
- **Cambiar el modelo base:** editar `src/room.js` (metros; origen en la esquina de la ventana) y ejecutar `npm install && npm run build`.
