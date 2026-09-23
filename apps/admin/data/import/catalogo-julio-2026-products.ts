export type CatalogoJulio2026Product = {
  boxWeight: string | null;
  brand: string | null;
  category: "cerdo" | "pollo" | "vacuno" | "trimming";
  code: string;
  cut: string;
  eyebrow: string;
  format: string | null;
  origin: string | null;
  page: number;
  title: string;
  units: string | null;
};

export const catalogoJulio2026Products: CatalogoJulio2026Product[] = [
  { page: 4, category: "cerdo", cut: "costillar", eyebrow: "Costillar Brasil", title: "Costillar de Cerdo Notable", code: "CF-1608", brand: "Notable", origin: "Brasil", boxWeight: "8 kg (peso variable)", format: "Vacío", units: "7-8 x caja" },
  { page: 5, category: "cerdo", cut: "costillar", eyebrow: "Costillar con Malaya", title: "Costillar con Malaya Litera Meat", code: "CF-1388", brand: "Litera Meat", origin: "España", boxWeight: "18 kg aprox.", format: "3-4 kg por unidad", units: "N/A" },
  { page: 6, category: "cerdo", cut: "costillar", eyebrow: "Costillar Europa", title: "Costillar Español Patel", code: "CF-1593", brand: "Patel", origin: "España", boxWeight: "10 kg (peso fijo)", format: "Vacío", units: "6 x caja" },
  { page: 7, category: "cerdo", cut: "costillar", eyebrow: "Costillar Brasil", title: "Costillar de Cerdo Sulita", code: "CF-1494", brand: "Sulita", origin: "Brasil", boxWeight: "17 kg aprox.", format: "Bolsa individual", units: "10 x caja" },
  { page: 8, category: "cerdo", cut: "costillar", eyebrow: "Costillar Brasil", title: "Costillar Palmali", code: "CF-1616", brand: "Palmali", origin: "Brasil", boxWeight: "22 kg (peso fijo)", format: "2,1-3,2 kg aprox.", units: "7 piezas embolsadas" },
  { page: 9, category: "cerdo", cut: "costillar", eyebrow: "Costillar Brasil", title: "Costillar Fricasa", code: "CF-1575", brand: "Fricasa", origin: "Brasil", boxWeight: "20 kg fijo", format: "1,6-2,2 kg aprox.", units: "10-11 unidades, embolsado individual" },
  { page: 10, category: "cerdo", cut: "costillar", eyebrow: "Costillar Americano", title: "Costillar de Hemra Abbyland", code: "CF-1557", brand: "Abbyland", origin: "USA", boxWeight: "18 kg aprox.", format: "Granel", units: "N/A" },
  { page: 11, category: "cerdo", cut: "costillar", eyebrow: "Costillar con Malaya", title: "Costillar con Malaya Friselva", code: "CF-1591", brand: "Friselva", origin: "Brasil", boxWeight: "19 kg aprox.", format: "Embolsado individual", units: "N/A" },
  { page: 12, category: "cerdo", cut: "baby-back-ribs", eyebrow: "Baby Back Ribs", title: "Costillitas Sulita", code: "CF-1613", brand: "Sulita", origin: "Brasil", boxWeight: "18 kg (peso variable)", format: "Vacío individual", units: "Entre 1 kg y 1,2 kg aprox." },
  { page: 13, category: "cerdo", cut: "baby-back-ribs", eyebrow: "Baby Back Ribs", title: "Baby Back Ribs Fricasa", code: "CF-1590", brand: "Fricasa", origin: "Brasil", boxWeight: "18 kg aprox.", format: "500 a 700 g", units: "Embolsadas de 2 unidades" },
  { page: 14, category: "cerdo", cut: "panceta", eyebrow: "Panceta sin Tecla", title: "Panceta Campo Frío", code: "CF-1594", brand: "Campo Frío", origin: "España", boxWeight: "12 kg (peso variable)", format: "Unidades variables a granel", units: "Granel" },
  { page: 15, category: "cerdo", cut: "chuletas", eyebrow: "Chuletas de Cerdo", title: "Chuleta Vetada Seara", code: "CF-1353", brand: "Seara", origin: "Brasil", boxWeight: "18 kg aprox.", format: "Embolsadas", units: "5-6 x caja" },
  { page: 16, category: "cerdo", cut: "chuletas", eyebrow: "Chuletas de Cerdo", title: "Chuleta Centro Aurora", code: "CF-1611", brand: "Aurora", origin: "Brasil", boxWeight: "25 kg (peso fijo)", format: "Unidades embolsadas", units: "N/A" },
  { page: 17, category: "cerdo", cut: "chuletas", eyebrow: "Chuletas Porcionadas", title: "Chuleta Vetada Porcionada", code: "CF-1262", brand: "Seara", origin: "Brasil", boxWeight: "18 kg (peso variable)", format: "Porcionadas a granel", units: "200-220 g" },
  { page: 18, category: "cerdo", cut: "chuletas", eyebrow: "Chuletas Porcionadas", title: "Chuleta Centro Porcionada", code: "CF-1264", brand: "Seara", origin: "Brasil", boxWeight: "18 kg (peso variable)", format: "Porcionadas a granel", units: "N/A" },
  { page: 19, category: "cerdo", cut: "chuletas", eyebrow: "Chuletas Porcionadas", title: "Chuleta Vetada Porcionada", code: "CF-1438", brand: "Seara", origin: "Brasil", boxWeight: "18 kg (peso variable)", format: "Porcionadas a granel", units: "150-160 g" },
  { page: 20, category: "cerdo", cut: "chuletas", eyebrow: "Chuletas de Cerdo", title: "Punta Chuleta Vetada", code: "CF-1586", brand: null, origin: null, boxWeight: null, format: null, units: null },
  { page: 21, category: "cerdo", cut: "chuletas", eyebrow: "Chuletas de Cerdo", title: "Punta Chuleta Centro", code: "CF-1585", brand: null, origin: null, boxWeight: null, format: null, units: null },
  { page: 22, category: "cerdo", cut: "chuletas", eyebrow: "Chuletas Porcionadas", title: "Chuleta Centro Porcionada IQF Agrosuper", code: "CF-1599", brand: "Agrosuper", origin: "Nacional", boxWeight: "18 kg (peso variable)", format: "Porcionadas IQF granel", units: "N/A" },
  { page: 23, category: "cerdo", cut: "pulpa-pierna", eyebrow: "Pulpa Pierna", title: "Pulpa Pierna Seara 90 VL", code: "CF-1449", brand: "Seara", origin: "Brasil", boxWeight: "18 kg (peso variable)", format: "N/A", units: "3-4 unidades por caja" },
  { page: 24, category: "cerdo", cut: "lomo-centro", eyebrow: "Lomo Centro", title: "Lomo de Cerdo Ecofrigo", code: "CF-1614", brand: "Ecofrigo", origin: "Brasil", boxWeight: "22 kg (peso variable)", format: "6-7 lomos individuales", units: "N/A" },
  { page: 25, category: "cerdo", cut: "lomo-centro", eyebrow: "Lomo Centro", title: "Lomo de Cerdo Palmani", code: "CF-1589", brand: "Palmani", origin: "Brasil", boxWeight: "20 kg (peso variable)", format: "6-7 lomos individuales", units: "N/A" },
  { page: 27, category: "pollo", cut: "pechuga", eyebrow: "Pechuga de Pollo", title: "Pechuga con Hueso Individual Languiru", code: "CF-1580", brand: "Languiru", origin: "Brasil", boxWeight: "15 kg", format: "Embolsada", units: "Individual" },
  { page: 28, category: "pollo", cut: "pechuga", eyebrow: "Pechuga de Pollo", title: "Pechuga Deshuesada Marinada Seara", code: "CF-1364", brand: "Seara", origin: "Brasil", boxWeight: "12 kg fijo", format: "Embolsada", units: "6 bolsas de 2 kg" },
  { page: 29, category: "pollo", cut: "pechuga", eyebrow: "Pechuga de Pollo", title: "Pechuga de Pollo Interfoliada Seara", code: "CF-1415", brand: "Seara", origin: "Brasil", boxWeight: "15 kg", format: "Interfoliada", units: "Interfoliada" },
  { page: 30, category: "pollo", cut: "pechuga", eyebrow: "Pechuga de Pollo", title: "Pechuga Deshuesada Seara", code: "CF-1597", brand: "Seara", origin: "Brasil", boxWeight: "12 kg fijo", format: "Embolsada", units: "6 bolsas de 2 kg" },
  { page: 31, category: "pollo", cut: "filetillo", eyebrow: "Filetillo de Pollo", title: "Filetillo de Pollo Marinado IQF Seara", code: "CF-1572", brand: "Seara", origin: "Brasil", boxWeight: "12 kg", format: "12 bolsas de 1 kg", units: "12 bolsas de 1 kg" },
  { page: 32, category: "pollo", cut: "filetillo", eyebrow: "Filetillo de Pollo", title: "Filetillo de Pollo IQF C-Vale", code: "CF-1220", brand: "C-Vale", origin: "Brasil", boxWeight: "10 kg", format: "Embolsado por kilo", units: "10 bolsas de 1 kg" },
  { page: 33, category: "pollo", cut: "filetillo", eyebrow: "Filetillo de Pollo", title: "Filetillo de Pollo NAT Interfoliado", code: "CF-1587", brand: "NAT", origin: "Brasil", boxWeight: "15 kg", format: "Interfoliado", units: "Embolsado" },
  { page: 34, category: "pollo", cut: "trutros", eyebrow: "Trutro", title: "Trutro Ala Perdix", code: "CF-1509", brand: "Perdix", origin: "Brasil", boxWeight: "15 kg", format: "Interfoliado", units: "N/A" },
  { page: 35, category: "pollo", cut: "trutros", eyebrow: "Trutro", title: "Trutro Cuarto Mountaire Farms", code: "CF-1485", brand: "Mountaire Farms", origin: "USA", boxWeight: "15 kg", format: "Granel", units: "Granel" },
  { page: 36, category: "pollo", cut: "trutros", eyebrow: "Trutro", title: "Trutro Entero Seara", code: "CF-1497", brand: "Seara", origin: "Brasil", boxWeight: "15 kg", format: "Interfoliado", units: "N/A" },
  { page: 37, category: "pollo", cut: "trutros", eyebrow: "Trutro", title: "Trutro Corto Interfoliado Levida", code: "CF-1607", brand: "Levida", origin: "Brasil", boxWeight: "15 kg", format: "Interfoliado", units: "N/A" },
  { page: 38, category: "pollo", cut: "pollo-entero", eyebrow: "Pollo Entero", title: "Pollo Entero Languiru sin Menudencias", code: "CF-1600\nCF-1601\nCF-1602\nCF-1603\nCF-1604", brand: "Languiru", origin: "Brasil", boxWeight: "14,4 kg\n15,2 kg\n16 kg\n16,8 kg\n17,6 kg", format: "Pollo 1,8 kg\nPollo 1,9 kg\nPollo 2,0 kg\nPollo 2,1 kg\nPollo 2,2 kg", units: "8 unidades x caja\n8 unidades x caja\n8 unidades x caja\n8 unidades x caja\n8 unidades x caja" },
  { page: 39, category: "pollo", cut: "pollo-entero", eyebrow: "Pollo Entero", title: "Pollo Entero sin Menudencia Seara 2,2", code: "CF-1414", brand: "Seara", origin: "Brasil", boxWeight: "15,4 kg", format: "Envasado / caja", units: "7 unidades de 2,2 kg" },
  { page: 41, category: "vacuno", cut: "posta", eyebrow: "Posta de Vacuno", title: "Posta Rosada Congelada PUL", code: "CF-1588", brand: "Minerva", origin: "Brasil", boxWeight: "20 kg (peso variable)", format: "Envasado / caja", units: "3-4 unidades x caja" },
  { page: 42, category: "vacuno", cut: "higado", eyebrow: "Vacuno", title: "Hígado de Vacuno FLP Foods", code: "CF-1577", brand: "FLP Foods", origin: "USA", boxWeight: "13,61 kg fijo", format: "Bloque, bolsa colectiva", units: null },
  { page: 44, category: "trimming", cut: "50-50", eyebrow: "Trimming", title: "Trimming 50/50", code: "CF-1004", brand: "Todo Carnes", origin: "Nacional", boxWeight: "20 kg", format: "Granel", units: "N/A" },
  { page: 45, category: "trimming", cut: "70-30", eyebrow: "Trimming", title: "Trimming 70/30", code: "CF-1002", brand: "Todo Carnes", origin: "Nacional", boxWeight: "20 kg", format: "Granel", units: "N/A" },
  { page: 46, category: "trimming", cut: "80-20", eyebrow: "Trimming", title: "Trimming 80/20", code: "CF-1003", brand: "Todo Carnes", origin: "Nacional", boxWeight: "20 kg", format: "Granel", units: "N/A" },
  { page: 47, category: "trimming", cut: "90-10", eyebrow: "Trimming", title: "Trimming 90/10", code: "CF-1046", brand: "Todo Carnes", origin: "Nacional", boxWeight: "20 kg", format: "Granel", units: "N/A" },
];
