import { ModApk, Author } from './types';

export const CATEGORY_INFO: Record<string, { image: string, desc: string }> = {
  'Panda Mouse': { image: '/images/panda.png', desc: 'Mapeadores avanzados para teclado y ratón.' },
  'GG Mouse': { image: '/images/gg.png', desc: 'Herramientas GameGuardian Pro optimizadas.' },
  'SSkey': { image: '/images/sskey.png', desc: 'Utilidades de activación y desbloqueo.' },
  'Otros': { image: '/images/otros.png', desc: 'Archivos y utilidades misceláneas.' }
};

export const INITIAL_AUTHORS: Author[] = [
  { id: '1', name: 'ComunidadGamer', category: 'Panda Mouse' },
  { id: '2', name: 'TRY JEAN PC', category: 'GG Mouse' },
  { id: '3', name: 'ModderX', category: 'SSkey' }
];

export const INITIAL_MODS: ModApk[] = [
  {
    id: '1',
    name: 'Panda VIP - No Root',
    author: 'ComunidadGamer',
    project: 'Panda VIP',
    version: '1.5.0-mod',
    description: 'Versión modificada con activación automática sin necesidad de PC. Sin anuncios.',
    category: 'Panda Mouse',
    uploadDate: new Date().toISOString().split('T')[0],
    size: '12.4 MB',
    downloads: 1450,
    screenshots: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80'
    ]
  },
  {
    id: '2',
    name: 'GG PRO 3 Ultimate',
    author: 'TRY JEAN PC',
    project: 'GG PRO 3',
    version: '3.1.0',
    description: 'Versión optimizada de GameGuardian con bypass para Android 12+. Funciona perfecto en todos los juegos.',
    category: 'GG Mouse',
    uploadDate: new Date().toISOString().split('T')[0],
    size: '18.1 MB',
    downloads: 3200,
    screenshots: [
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80',
      'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&q=80'
    ]
  },
  {
    id: '3',
    name: 'GG PRO 2 Clásico',
    author: 'TRY JEAN PC',
    project: 'GG PRO 2',
    version: '2.5.4',
    description: 'La versión más estable para dispositivos de gama baja. Sin lags.',
    category: 'GG Mouse',
    uploadDate: new Date().toISOString().split('T')[0],
    size: '15.0 MB',
    downloads: 850
  },
  {
    id: '4',
    name: 'SSkey Pro Unlocker',
    author: 'ModderX',
    project: 'SSkey Pro',
    version: '6.1.4',
    description: 'Herramienta de activación total. Funciones Pro desbloqueadas de por vida.',
    category: 'SSkey',
    uploadDate: new Date().toISOString().split('T')[0],
    size: '22.0 MB',
    downloads: 410
  }
];
