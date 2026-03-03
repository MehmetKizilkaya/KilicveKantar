import { prisma } from './config/prisma';

// Base prices mirror packages/shared/src/types/economy.ts
const BASE_PRICES: Record<string, number> = {
  wheat: 50, iron: 120, wood: 80, stone: 60, wool: 70, cotton: 90,
  copper: 100, salt: 40, olive_oil: 150,
  sword: 400, shield: 250, armor: 600, bread: 80, cloth: 200,
  ship: 800, gunpowder: 500,
  silk: 1200, gold_ornament: 800, firearm: 1500,
};

// Primary and secondary commodities per region type
const TYPE_COMMODITIES: Record<string, { primary: string[]; secondary: string[] }> = {
  AGRICULTURE: { primary: ['wheat', 'bread', 'wool'], secondary: ['wood', 'cotton'] },
  INDUSTRIAL:  { primary: ['iron', 'wood', 'stone'], secondary: ['copper', 'gunpowder'] },
  TRADE:       { primary: ['cloth', 'gold_ornament'], secondary: ['silk', 'bread'] },
  MILITARY:    { primary: ['sword', 'armor', 'shield'], secondary: ['iron', 'gunpowder'] },
  COASTAL:     { primary: ['salt', 'ship', 'olive_oil'], secondary: ['cloth', 'wheat'] },
};

// 81 Turkish provinces
const REGIONS = [
  { name: 'Adana',          code: 'TR-01', type: 'COASTAL' as const,     svgPathId: 'TR01', economicValue: 180, militaryValue: 120, specialResource: 'cotton' },
  { name: 'Adıyaman',       code: 'TR-02', type: 'AGRICULTURE' as const, svgPathId: 'TR02', economicValue: 80,  militaryValue: 80  },
  { name: 'Afyonkarahisar', code: 'TR-03', type: 'AGRICULTURE' as const, svgPathId: 'TR03', economicValue: 90,  militaryValue: 90  },
  { name: 'Ağrı',           code: 'TR-04', type: 'MILITARY' as const,    svgPathId: 'TR04', economicValue: 60,  militaryValue: 150 },
  { name: 'Amasya',         code: 'TR-05', type: 'AGRICULTURE' as const, svgPathId: 'TR05', economicValue: 85,  militaryValue: 85  },
  { name: 'Ankara',         code: 'TR-06', type: 'MILITARY' as const,    svgPathId: 'TR06', economicValue: 250, militaryValue: 200 },
  { name: 'Antalya',        code: 'TR-07', type: 'COASTAL' as const,     svgPathId: 'TR07', economicValue: 200, militaryValue: 110, specialResource: 'olive_oil' },
  { name: 'Artvin',         code: 'TR-08', type: 'MILITARY' as const,    svgPathId: 'TR08', economicValue: 70,  militaryValue: 130 },
  { name: 'Aydın',          code: 'TR-09', type: 'COASTAL' as const,     svgPathId: 'TR09', economicValue: 150, militaryValue: 100, specialResource: 'cotton' },
  { name: 'Balıkesir',      code: 'TR-10', type: 'COASTAL' as const,     svgPathId: 'TR10', economicValue: 140, militaryValue: 110 },
  { name: 'Bilecik',        code: 'TR-11', type: 'INDUSTRIAL' as const,  svgPathId: 'TR11', economicValue: 110, militaryValue: 100 },
  { name: 'Bingöl',         code: 'TR-12', type: 'MILITARY' as const,    svgPathId: 'TR12', economicValue: 60,  militaryValue: 120 },
  { name: 'Bitlis',         code: 'TR-13', type: 'MILITARY' as const,    svgPathId: 'TR13', economicValue: 65,  militaryValue: 130 },
  { name: 'Bolu',           code: 'TR-14', type: 'AGRICULTURE' as const, svgPathId: 'TR14', economicValue: 95,  militaryValue: 90,  specialResource: 'wood' },
  { name: 'Burdur',         code: 'TR-15', type: 'AGRICULTURE' as const, svgPathId: 'TR15', economicValue: 85,  militaryValue: 80  },
  { name: 'Bursa',          code: 'TR-16', type: 'INDUSTRIAL' as const,  svgPathId: 'TR16', economicValue: 230, militaryValue: 140, specialResource: 'silk' },
  { name: 'Çanakkale',      code: 'TR-17', type: 'COASTAL' as const,     svgPathId: 'TR17', economicValue: 130, militaryValue: 180 },
  { name: 'Çankırı',        code: 'TR-18', type: 'AGRICULTURE' as const, svgPathId: 'TR18', economicValue: 70,  militaryValue: 80  },
  { name: 'Çorum',          code: 'TR-19', type: 'AGRICULTURE' as const, svgPathId: 'TR19', economicValue: 85,  militaryValue: 85  },
  { name: 'Denizli',        code: 'TR-20', type: 'TRADE' as const,       svgPathId: 'TR20', economicValue: 160, militaryValue: 100 },
  { name: 'Diyarbakır',     code: 'TR-21', type: 'MILITARY' as const,    svgPathId: 'TR21', economicValue: 130, militaryValue: 160 },
  { name: 'Edirne',         code: 'TR-22', type: 'MILITARY' as const,    svgPathId: 'TR22', economicValue: 110, militaryValue: 150 },
  { name: 'Elazığ',         code: 'TR-23', type: 'INDUSTRIAL' as const,  svgPathId: 'TR23', economicValue: 100, militaryValue: 110 },
  { name: 'Erzincan',       code: 'TR-24', type: 'MILITARY' as const,    svgPathId: 'TR24', economicValue: 75,  militaryValue: 130 },
  { name: 'Erzurum',        code: 'TR-25', type: 'MILITARY' as const,    svgPathId: 'TR25', economicValue: 100, militaryValue: 200 },
  { name: 'Eskişehir',      code: 'TR-26', type: 'INDUSTRIAL' as const,  svgPathId: 'TR26', economicValue: 160, militaryValue: 120 },
  { name: 'Gaziantep',      code: 'TR-27', type: 'TRADE' as const,       svgPathId: 'TR27', economicValue: 190, militaryValue: 130, specialResource: 'copper' },
  { name: 'Giresun',        code: 'TR-28', type: 'COASTAL' as const,     svgPathId: 'TR28', economicValue: 100, militaryValue: 90  },
  { name: 'Gümüşhane',      code: 'TR-29', type: 'MILITARY' as const,    svgPathId: 'TR29', economicValue: 65,  militaryValue: 110, specialResource: 'copper' },
  { name: 'Hakkari',        code: 'TR-30', type: 'MILITARY' as const,    svgPathId: 'TR30', economicValue: 55,  militaryValue: 160 },
  { name: 'Hatay',          code: 'TR-31', type: 'COASTAL' as const,     svgPathId: 'TR31', economicValue: 150, militaryValue: 140 },
  { name: 'Isparta',        code: 'TR-32', type: 'AGRICULTURE' as const, svgPathId: 'TR32', economicValue: 90,  militaryValue: 80  },
  { name: 'Mersin',         code: 'TR-33', type: 'COASTAL' as const,     svgPathId: 'TR33', economicValue: 170, militaryValue: 120 },
  { name: 'İstanbul',       code: 'TR-34', type: 'TRADE' as const,       svgPathId: 'TR34', economicValue: 400, militaryValue: 250 },
  { name: 'İzmir',          code: 'TR-35', type: 'COASTAL' as const,     svgPathId: 'TR35', economicValue: 300, militaryValue: 180, specialResource: 'olive_oil' },
  { name: 'Kars',           code: 'TR-36', type: 'MILITARY' as const,    svgPathId: 'TR36', economicValue: 65,  militaryValue: 170 },
  { name: 'Kastamonu',      code: 'TR-37', type: 'AGRICULTURE' as const, svgPathId: 'TR37', economicValue: 80,  militaryValue: 90,  specialResource: 'wood' },
  { name: 'Kayseri',        code: 'TR-38', type: 'INDUSTRIAL' as const,  svgPathId: 'TR38', economicValue: 180, militaryValue: 130 },
  { name: 'Kırklareli',     code: 'TR-39', type: 'AGRICULTURE' as const, svgPathId: 'TR39', economicValue: 100, militaryValue: 120 },
  { name: 'Kırşehir',       code: 'TR-40', type: 'AGRICULTURE' as const, svgPathId: 'TR40', economicValue: 80,  militaryValue: 85  },
  { name: 'Kocaeli',        code: 'TR-41', type: 'INDUSTRIAL' as const,  svgPathId: 'TR41', economicValue: 220, militaryValue: 150 },
  { name: 'Konya',          code: 'TR-42', type: 'AGRICULTURE' as const, svgPathId: 'TR42', economicValue: 200, militaryValue: 130, specialResource: 'wheat' },
  { name: 'Kütahya',        code: 'TR-43', type: 'INDUSTRIAL' as const,  svgPathId: 'TR43', economicValue: 110, militaryValue: 100 },
  { name: 'Malatya',        code: 'TR-44', type: 'AGRICULTURE' as const, svgPathId: 'TR44', economicValue: 120, militaryValue: 110 },
  { name: 'Manisa',         code: 'TR-45', type: 'AGRICULTURE' as const, svgPathId: 'TR45', economicValue: 150, militaryValue: 110, specialResource: 'cotton' },
  { name: 'Kahramanmaraş',  code: 'TR-46', type: 'INDUSTRIAL' as const,  svgPathId: 'TR46', economicValue: 130, militaryValue: 110 },
  { name: 'Mardin',         code: 'TR-47', type: 'MILITARY' as const,    svgPathId: 'TR47', economicValue: 100, militaryValue: 140 },
  { name: 'Muğla',          code: 'TR-48', type: 'COASTAL' as const,     svgPathId: 'TR48', economicValue: 160, militaryValue: 100 },
  { name: 'Muş',            code: 'TR-49', type: 'MILITARY' as const,    svgPathId: 'TR49', economicValue: 60,  militaryValue: 120 },
  { name: 'Nevşehir',       code: 'TR-50', type: 'TRADE' as const,       svgPathId: 'TR50', economicValue: 110, militaryValue: 90  },
  { name: 'Niğde',          code: 'TR-51', type: 'AGRICULTURE' as const, svgPathId: 'TR51', economicValue: 85,  militaryValue: 80  },
  { name: 'Ordu',           code: 'TR-52', type: 'COASTAL' as const,     svgPathId: 'TR52', economicValue: 100, militaryValue: 90  },
  { name: 'Rize',           code: 'TR-53', type: 'COASTAL' as const,     svgPathId: 'TR53', economicValue: 90,  militaryValue: 85  },
  { name: 'Sakarya',        code: 'TR-54', type: 'INDUSTRIAL' as const,  svgPathId: 'TR54', economicValue: 150, militaryValue: 110 },
  { name: 'Samsun',         code: 'TR-55', type: 'COASTAL' as const,     svgPathId: 'TR55', economicValue: 170, militaryValue: 120 },
  { name: 'Siirt',          code: 'TR-56', type: 'MILITARY' as const,    svgPathId: 'TR56', economicValue: 65,  militaryValue: 130 },
  { name: 'Sinop',          code: 'TR-57', type: 'COASTAL' as const,     svgPathId: 'TR57', economicValue: 85,  militaryValue: 90  },
  { name: 'Sivas',          code: 'TR-58', type: 'MILITARY' as const,    svgPathId: 'TR58', economicValue: 110, militaryValue: 130 },
  { name: 'Tekirdağ',       code: 'TR-59', type: 'AGRICULTURE' as const, svgPathId: 'TR59', economicValue: 130, militaryValue: 130 },
  { name: 'Tokat',          code: 'TR-60', type: 'AGRICULTURE' as const, svgPathId: 'TR60', economicValue: 90,  militaryValue: 90  },
  { name: 'Trabzon',        code: 'TR-61', type: 'COASTAL' as const,     svgPathId: 'TR61', economicValue: 150, militaryValue: 120 },
  { name: 'Tunceli',        code: 'TR-62', type: 'MILITARY' as const,    svgPathId: 'TR62', economicValue: 55,  militaryValue: 140 },
  { name: 'Şanlıurfa',      code: 'TR-63', type: 'AGRICULTURE' as const, svgPathId: 'TR63', economicValue: 130, militaryValue: 120 },
  { name: 'Uşak',           code: 'TR-64', type: 'INDUSTRIAL' as const,  svgPathId: 'TR64', economicValue: 100, militaryValue: 90  },
  { name: 'Van',            code: 'TR-65', type: 'MILITARY' as const,    svgPathId: 'TR65', economicValue: 80,  militaryValue: 160 },
  { name: 'Yozgat',         code: 'TR-66', type: 'AGRICULTURE' as const, svgPathId: 'TR66', economicValue: 80,  militaryValue: 85  },
  { name: 'Zonguldak',      code: 'TR-67', type: 'INDUSTRIAL' as const,  svgPathId: 'TR67', economicValue: 130, militaryValue: 110, specialResource: 'iron' },
  { name: 'Aksaray',        code: 'TR-68', type: 'AGRICULTURE' as const, svgPathId: 'TR68', economicValue: 85,  militaryValue: 80  },
  { name: 'Bayburt',        code: 'TR-69', type: 'MILITARY' as const,    svgPathId: 'TR69', economicValue: 55,  militaryValue: 110 },
  { name: 'Karaman',        code: 'TR-70', type: 'AGRICULTURE' as const, svgPathId: 'TR70', economicValue: 85,  militaryValue: 80  },
  { name: 'Kırıkkale',      code: 'TR-71', type: 'INDUSTRIAL' as const,  svgPathId: 'TR71', economicValue: 110, militaryValue: 120 },
  { name: 'Batman',         code: 'TR-72', type: 'INDUSTRIAL' as const,  svgPathId: 'TR72', economicValue: 120, militaryValue: 110 },
  { name: 'Şırnak',         code: 'TR-73', type: 'MILITARY' as const,    svgPathId: 'TR73', economicValue: 60,  militaryValue: 150 },
  { name: 'Bartın',         code: 'TR-74', type: 'COASTAL' as const,     svgPathId: 'TR74', economicValue: 80,  militaryValue: 85  },
  { name: 'Ardahan',        code: 'TR-75', type: 'MILITARY' as const,    svgPathId: 'TR75', economicValue: 55,  militaryValue: 140 },
  { name: 'Iğdır',          code: 'TR-76', type: 'MILITARY' as const,    svgPathId: 'TR76', economicValue: 60,  militaryValue: 120 },
  { name: 'Yalova',         code: 'TR-77', type: 'COASTAL' as const,     svgPathId: 'TR77', economicValue: 120, militaryValue: 90  },
  { name: 'Karabük',        code: 'TR-78', type: 'INDUSTRIAL' as const,  svgPathId: 'TR78', economicValue: 100, militaryValue: 100, specialResource: 'iron' },
  { name: 'Kilis',          code: 'TR-79', type: 'MILITARY' as const,    svgPathId: 'TR79', economicValue: 70,  militaryValue: 110 },
  { name: 'Osmaniye',       code: 'TR-80', type: 'AGRICULTURE' as const, svgPathId: 'TR80', economicValue: 90,  militaryValue: 90  },
  { name: 'Düzce',          code: 'TR-81', type: 'COASTAL' as const,     svgPathId: 'TR81', economicValue: 95,  militaryValue: 90  },
];

function npcOrdersForRegion(
  regionId: string,
  type: string,
  specialResource: string | undefined,
): Array<{ regionId: string; commodity: string; stock: number; maxStock: number; buyPrice: number; sellPrice: number; refreshAmount: number }> {
  const orders: ReturnType<typeof npcOrdersForRegion> = [];
  const typeCommodities = TYPE_COMMODITIES[type] ?? TYPE_COMMODITIES.TRADE;

  // Determine all commodities this region trades
  const primaryCommodities = specialResource
    ? [specialResource, ...typeCommodities.primary.filter((c) => c !== specialResource)]
    : typeCommodities.primary;
  const secondaryCommodities = typeCommodities.secondary;

  for (const commodity of primaryCommodities.slice(0, 3)) {
    const base = BASE_PRICES[commodity] ?? 100;
    orders.push({
      regionId,
      commodity,
      stock: 80,
      maxStock: 200,
      buyPrice:  Math.round(base * 1.05),  // NPC sells at +5% (specialty)
      sellPrice: Math.round(base * 0.95),  // NPC buys at -5% (specialty)
      refreshAmount: 15,
    });
  }

  for (const commodity of secondaryCommodities.slice(0, 2)) {
    const base = BASE_PRICES[commodity] ?? 100;
    orders.push({
      regionId,
      commodity,
      stock: 30,
      maxStock: 80,
      buyPrice:  Math.round(base * 1.20), // NPC sells at +20%
      sellPrice: Math.round(base * 0.80), // NPC buys at -20%
      refreshAmount: 5,
    });
  }

  return orders;
}

async function main() {
  console.log('🌱 Seed başlatılıyor...');

  // 1. Upsert all 81 regions
  for (const region of REGIONS) {
    await prisma.region.upsert({
      where: { code: region.code },
      update: { svgPathId: region.svgPathId }, // update svg path id format
      create: {
        name: region.name,
        code: region.code,
        type: region.type,
        svgPathId: region.svgPathId,
        economicValue: region.economicValue,
        militaryValue: region.militaryValue,
        specialResource: region.specialResource ?? null,
        stats: {
          create: { taxRate: 10, defenseLevel: 1 },
        },
      },
    });
  }
  console.log(`✅ ${REGIONS.length} il oluşturuldu/güncellendi`);

  // 2. Seed NPC orders for each region
  let npcCount = 0;
  for (const region of REGIONS) {
    const dbRegion = await prisma.region.findUnique({ where: { code: region.code } });
    if (!dbRegion) continue;

    const orders = npcOrdersForRegion(dbRegion.id, region.type, region.specialResource);
    for (const order of orders) {
      await prisma.npcOrder.upsert({
        where: { regionId_commodity: { regionId: order.regionId, commodity: order.commodity } },
        update: { buyPrice: order.buyPrice, sellPrice: order.sellPrice },
        create: order,
      });
      npcCount++;
    }
  }
  console.log(`✅ ${npcCount} NPC emri oluşturuldu`);

  console.log('🎉 Seed tamamlandı');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
