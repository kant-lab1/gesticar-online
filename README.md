# Gesticar Online

Demo frontend SaaS/ERP para compraventas de vehículos de ocasión.

## Arranque

```bash
cd ~/Projects/autostock-erp
npm install
npm run dev
```

Abre http://localhost:5174/

## Demo

- Producto: **Gesticar Online**
- Empresa: **Motor Canarias Premium** (Santa Cruz de Tenerife)
- Usuario: Alejandro Martín (Administrador)
- Login visual (opcional): `/login` → demo@gesticaronline.es / demo123

## Flujo recomendado para presentar

1. Dashboard — stock, capital inmovilizado, margen potencial
2. Inventario — coches con +90 días (alerta)
3. Ficha BMW 320d — compra + gastos = coste real, margen
4. Añadir gasto de taller → ver cómo baja el margen
5. Simular precio / publicar web
6. Registrar venta → volver al Dashboard actualizado

## Notas

- Sin backend: datos mock + `localStorage`
- Resetear demo: Configuración → Resetear demo
- Nombre del producto configurable en `src/config/app.ts`
