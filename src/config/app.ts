export const APP = {
  name: 'GestiCar',
  tagline: 'ERP para compraventas',
  short: 'GC',
  version: '1.0.0-demo',
} as const

export const DEALERSHIP = {
  name: 'GestiCar Canarias',
  location: 'Santa Cruz de Tenerife',
  cif: 'B38999123',
  phone: '922 123 456',
  email: 'hola@gesticar.online',
  web: 'gesticar.online',
  address: 'Av. de Anaga 48, 38001 Santa Cruz de Tenerife',
} as const

export const DEMO_USER = {
  name: 'Alejandro Martín',
  email: 'demo@gesticaronline.es',
  password: 'demo123',
  role: 'Administrador',
  initials: 'AM',
} as const

export const STORAGE_KEY = 'gesticar-online-v2'

export const DEFAULT_CONTRACT_BODY = `CONTRATO DE COMPRAVENTA DE VEHÍCULO

{{logo}}

Entre {{empresa}}, con CIF {{cif}}, domicilio en {{direccion}} (en adelante, EL VENDEDOR),

y {{cliente}}, con NIF/CIF {{cliente_nif}} (en adelante, EL COMPRADOR).

Ambas partes acuerdan la compraventa del siguiente vehículo:

• Marca / Modelo: {{marca}} {{modelo}} {{version}}
• Matrícula: {{matricula}}
• Bastidor (VIN): {{vin}}
• Año: {{anio}}
• Kilometraje: {{km}}
• Combustible / Cambio: {{combustible}} / {{cambio}}
• Color: {{color}}

PRECIO DE VENTA: {{precio}}
Fecha del contrato: {{fecha}}

El VENDEDOR declara que el vehículo se entrega libre de cargas y con la documentación en regla (permiso de circulación, ficha técnica e ITV en vigor, en su caso).

El COMPRADOR declara haber examinado el vehículo y acepta su estado.

Firmado en {{ubicacion}}, a {{fecha}}.


_________________________          _________________________
EL VENDEDOR                        EL COMPRADOR
{{empresa}}                        {{cliente}}
`
