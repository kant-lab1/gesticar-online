/** Fotos locales por marca/modelo (sin marca de agua). */
const PHOTO_MAP: Record<string, string> = {
  'bmw|serie 3': '/cars/bmw-serie-3.jpg',
  'bmw|x1': '/cars/bmw-x1.jpg',
  'audi|a3': '/cars/audi-a3.jpg',
  'audi|q3': '/cars/audi-q3.jpg',
  'mercedes-benz|clase a': '/cars/mercedes-clase-a.jpg',
  'mercedes-benz|gla': '/cars/mercedes-gla.jpg',
  'volkswagen|golf': '/cars/vw-golf.jpg',
  'volkswagen|t-roc': '/cars/vw-troc.jpg',
  'seat|leon': '/cars/seat-leon.jpg',
  'seat|león': '/cars/seat-leon.jpg',
  'cupra|formentor': '/cars/cupra-formentor.jpg',
  'peugeot|3008': '/cars/peugeot-3008.jpg',
  'peugeot|208': '/cars/peugeot-208.jpg',
  'toyota|c-hr': '/cars/toyota-chr.jpg',
  'toyota|corolla': '/cars/toyota-corolla.jpg',
  'hyundai|tucson': '/cars/hyundai-tucson.jpg',
  'kia|sportage': '/cars/kia-sportage.jpg',
  'renault|captur': '/cars/renault-captur.jpg',
  'renault|clio': '/cars/renault-clio.jpg',
  'ford|puma': '/cars/ford-puma.jpg',
  'nissan|qashqai': '/cars/nissan-qashqai.jpg',
  'mazda|cx-30': '/cars/mazda-cx30.jpg',
  'opel|corsa': '/cars/opel-corsa.jpg',
  'skoda|karoq': '/cars/skoda-karoq.jpg',
  'volvo|xc40': '/cars/volvo-xc40.jpg',
}

function key(brand: string, model: string) {
  return `${brand}|${model}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function vehicleImage(brand: string, model: string, _n = 1): string {
  const k = key(brand, model)
  // try exact, then without accents already normalized
  if (PHOTO_MAP[k]) return PHOTO_MAP[k]
  const alt = `${brand}|${model}`.toLowerCase()
  return PHOTO_MAP[alt] ?? ''
}
