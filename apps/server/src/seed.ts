import { prisma } from './config/prisma';

// 81 Turkish provinces with SVG path IDs, types, and neighbors
const REGIONS = [
  { name: 'Adana', code: 'TR-01', type: 'COASTAL' as const, svgPathId: 'tr-01', economicValue: 180, militaryValue: 120, specialResource: 'cotton', neighborIds: [] },
  { name: 'Adıyaman', code: 'TR-02', type: 'AGRICULTURE' as const, svgPathId: 'tr-02', economicValue: 80, militaryValue: 80 },
  { name: 'Afyonkarahisar', code: 'TR-03', type: 'AGRICULTURE' as const, svgPathId: 'tr-03', economicValue: 90, militaryValue: 90 },
  { name: 'Ağrı', code: 'TR-04', type: 'MILITARY' as const, svgPathId: 'tr-04', economicValue: 60, militaryValue: 150 },
  { name: 'Amasya', code: 'TR-05', type: 'AGRICULTURE' as const, svgPathId: 'tr-05', economicValue: 85, militaryValue: 85 },
  { name: 'Ankara', code: 'TR-06', type: 'MILITARY' as const, svgPathId: 'tr-06', economicValue: 250, militaryValue: 200, specialResource: null },
  { name: 'Antalya', code: 'TR-07', type: 'COASTAL' as const, svgPathId: 'tr-07', economicValue: 200, militaryValue: 110, specialResource: 'olive_oil' },
  { name: 'Artvin', code: 'TR-08', type: 'MILITARY' as const, svgPathId: 'tr-08', economicValue: 70, militaryValue: 130 },
  { name: 'Aydın', code: 'TR-09', type: 'COASTAL' as const, svgPathId: 'tr-09', economicValue: 150, militaryValue: 100, specialResource: 'cotton' },
  { name: 'Balıkesir', code: 'TR-10', type: 'COASTAL' as const, svgPathId: 'tr-10', economicValue: 140, militaryValue: 110 },
  { name: 'Bilecik', code: 'TR-11', type: 'INDUSTRIAL' as const, svgPathId: 'tr-11', economicValue: 110, militaryValue: 100 },
  { name: 'Bingöl', code: 'TR-12', type: 'MILITARY' as const, svgPathId: 'tr-12', economicValue: 60, militaryValue: 120 },
  { name: 'Bitlis', code: 'TR-13', type: 'MILITARY' as const, svgPathId: 'tr-13', economicValue: 65, militaryValue: 130 },
  { name: 'Bolu', code: 'TR-14', type: 'AGRICULTURE' as const, svgPathId: 'tr-14', economicValue: 95, militaryValue: 90 },
  { name: 'Burdur', code: 'TR-15', type: 'AGRICULTURE' as const, svgPathId: 'tr-15', economicValue: 85, militaryValue: 80 },
  { name: 'Bursa', code: 'TR-16', type: 'INDUSTRIAL' as const, svgPathId: 'tr-16', economicValue: 230, militaryValue: 140, specialResource: 'silk' },
  { name: 'Çanakkale', code: 'TR-17', type: 'COASTAL' as const, svgPathId: 'tr-17', economicValue: 130, militaryValue: 180, specialResource: null },
  { name: 'Çankırı', code: 'TR-18', type: 'AGRICULTURE' as const, svgPathId: 'tr-18', economicValue: 70, militaryValue: 80 },
  { name: 'Çorum', code: 'TR-19', type: 'AGRICULTURE' as const, svgPathId: 'tr-19', economicValue: 85, militaryValue: 85 },
  { name: 'Denizli', code: 'TR-20', type: 'TRADE' as const, svgPathId: 'tr-20', economicValue: 160, militaryValue: 100 },
  { name: 'Diyarbakır', code: 'TR-21', type: 'MILITARY' as const, svgPathId: 'tr-21', economicValue: 130, militaryValue: 160 },
  { name: 'Edirne', code: 'TR-22', type: 'MILITARY' as const, svgPathId: 'tr-22', economicValue: 110, militaryValue: 150 },
  { name: 'Elazığ', code: 'TR-23', type: 'INDUSTRIAL' as const, svgPathId: 'tr-23', economicValue: 100, militaryValue: 110 },
  { name: 'Erzincan', code: 'TR-24', type: 'MILITARY' as const, svgPathId: 'tr-24', economicValue: 75, militaryValue: 130 },
  { name: 'Erzurum', code: 'TR-25', type: 'MILITARY' as const, svgPathId: 'tr-25', economicValue: 100, militaryValue: 200, specialResource: null },
  { name: 'Eskişehir', code: 'TR-26', type: 'INDUSTRIAL' as const, svgPathId: 'tr-26', economicValue: 160, militaryValue: 120 },
  { name: 'Gaziantep', code: 'TR-27', type: 'TRADE' as const, svgPathId: 'tr-27', economicValue: 190, militaryValue: 130 },
  { name: 'Giresun', code: 'TR-28', type: 'COASTAL' as const, svgPathId: 'tr-28', economicValue: 100, militaryValue: 90 },
  { name: 'Gümüşhane', code: 'TR-29', type: 'MILITARY' as const, svgPathId: 'tr-29', economicValue: 65, militaryValue: 110, specialResource: 'copper' },
  { name: 'Hakkari', code: 'TR-30', type: 'MILITARY' as const, svgPathId: 'tr-30', economicValue: 55, militaryValue: 160 },
  { name: 'Hatay', code: 'TR-31', type: 'COASTAL' as const, svgPathId: 'tr-31', economicValue: 150, militaryValue: 140 },
  { name: 'Isparta', code: 'TR-32', type: 'AGRICULTURE' as const, svgPathId: 'tr-32', economicValue: 90, militaryValue: 80 },
  { name: 'Mersin', code: 'TR-33', type: 'COASTAL' as const, svgPathId: 'tr-33', economicValue: 170, militaryValue: 120 },
  { name: 'İstanbul', code: 'TR-34', type: 'TRADE' as const, svgPathId: 'tr-34', economicValue: 400, militaryValue: 250, specialResource: null },
  { name: 'İzmir', code: 'TR-35', type: 'COASTAL' as const, svgPathId: 'tr-35', economicValue: 300, militaryValue: 180, specialResource: 'olive_oil' },
  { name: 'Kars', code: 'TR-36', type: 'MILITARY' as const, svgPathId: 'tr-36', economicValue: 65, militaryValue: 170 },
  { name: 'Kastamonu', code: 'TR-37', type: 'AGRICULTURE' as const, svgPathId: 'tr-37', economicValue: 80, militaryValue: 90 },
  { name: 'Kayseri', code: 'TR-38', type: 'INDUSTRIAL' as const, svgPathId: 'tr-38', economicValue: 180, militaryValue: 130 },
  { name: 'Kırklareli', code: 'TR-39', type: 'AGRICULTURE' as const, svgPathId: 'tr-39', economicValue: 100, militaryValue: 120 },
  { name: 'Kırşehir', code: 'TR-40', type: 'AGRICULTURE' as const, svgPathId: 'tr-40', economicValue: 80, militaryValue: 85 },
  { name: 'Kocaeli', code: 'TR-41', type: 'INDUSTRIAL' as const, svgPathId: 'tr-41', economicValue: 220, militaryValue: 150 },
  { name: 'Konya', code: 'TR-42', type: 'AGRICULTURE' as const, svgPathId: 'tr-42', economicValue: 200, militaryValue: 130, specialResource: 'wheat' },
  { name: 'Kütahya', code: 'TR-43', type: 'INDUSTRIAL' as const, svgPathId: 'tr-43', economicValue: 110, militaryValue: 100 },
  { name: 'Malatya', code: 'TR-44', type: 'AGRICULTURE' as const, svgPathId: 'tr-44', economicValue: 120, militaryValue: 110 },
  { name: 'Manisa', code: 'TR-45', type: 'AGRICULTURE' as const, svgPathId: 'tr-45', economicValue: 150, militaryValue: 110 },
  { name: 'Kahramanmaraş', code: 'TR-46', type: 'INDUSTRIAL' as const, svgPathId: 'tr-46', economicValue: 130, militaryValue: 110 },
  { name: 'Mardin', code: 'TR-47', type: 'MILITARY' as const, svgPathId: 'tr-47', economicValue: 100, militaryValue: 140 },
  { name: 'Muğla', code: 'TR-48', type: 'COASTAL' as const, svgPathId: 'tr-48', economicValue: 160, militaryValue: 100 },
  { name: 'Muş', code: 'TR-49', type: 'MILITARY' as const, svgPathId: 'tr-49', economicValue: 60, militaryValue: 120 },
  { name: 'Nevşehir', code: 'TR-50', type: 'TRADE' as const, svgPathId: 'tr-50', economicValue: 110, militaryValue: 90 },
  { name: 'Niğde', code: 'TR-51', type: 'AGRICULTURE' as const, svgPathId: 'tr-51', economicValue: 85, militaryValue: 80 },
  { name: 'Ordu', code: 'TR-52', type: 'COASTAL' as const, svgPathId: 'tr-52', economicValue: 100, militaryValue: 90 },
  { name: 'Rize', code: 'TR-53', type: 'COASTAL' as const, svgPathId: 'tr-53', economicValue: 90, militaryValue: 85 },
  { name: 'Sakarya', code: 'TR-54', type: 'INDUSTRIAL' as const, svgPathId: 'tr-54', economicValue: 150, militaryValue: 110 },
  { name: 'Samsun', code: 'TR-55', type: 'COASTAL' as const, svgPathId: 'tr-55', economicValue: 170, militaryValue: 120, specialResource: null },
  { name: 'Siirt', code: 'TR-56', type: 'MILITARY' as const, svgPathId: 'tr-56', economicValue: 65, militaryValue: 130 },
  { name: 'Sinop', code: 'TR-57', type: 'COASTAL' as const, svgPathId: 'tr-57', economicValue: 85, militaryValue: 90 },
  { name: 'Sivas', code: 'TR-58', type: 'MILITARY' as const, svgPathId: 'tr-58', economicValue: 110, militaryValue: 130 },
  { name: 'Tekirdağ', code: 'TR-59', type: 'AGRICULTURE' as const, svgPathId: 'tr-59', economicValue: 130, militaryValue: 130 },
  { name: 'Tokat', code: 'TR-60', type: 'AGRICULTURE' as const, svgPathId: 'tr-60', economicValue: 90, militaryValue: 90 },
  { name: 'Trabzon', code: 'TR-61', type: 'COASTAL' as const, svgPathId: 'tr-61', economicValue: 150, militaryValue: 120, specialResource: null },
  { name: 'Tunceli', code: 'TR-62', type: 'MILITARY' as const, svgPathId: 'tr-62', economicValue: 55, militaryValue: 140 },
  { name: 'Şanlıurfa', code: 'TR-63', type: 'AGRICULTURE' as const, svgPathId: 'tr-63', economicValue: 130, militaryValue: 120 },
  { name: 'Uşak', code: 'TR-64', type: 'INDUSTRIAL' as const, svgPathId: 'tr-64', economicValue: 100, militaryValue: 90 },
  { name: 'Van', code: 'TR-65', type: 'MILITARY' as const, svgPathId: 'tr-65', economicValue: 80, militaryValue: 160 },
  { name: 'Yozgat', code: 'TR-66', type: 'AGRICULTURE' as const, svgPathId: 'tr-66', economicValue: 80, militaryValue: 85 },
  { name: 'Zonguldak', code: 'TR-67', type: 'INDUSTRIAL' as const, svgPathId: 'tr-67', economicValue: 130, militaryValue: 110, specialResource: 'iron' },
  { name: 'Aksaray', code: 'TR-68', type: 'AGRICULTURE' as const, svgPathId: 'tr-68', economicValue: 85, militaryValue: 80 },
  { name: 'Bayburt', code: 'TR-69', type: 'MILITARY' as const, svgPathId: 'tr-69', economicValue: 55, militaryValue: 110 },
  { name: 'Karaman', code: 'TR-70', type: 'AGRICULTURE' as const, svgPathId: 'tr-70', economicValue: 85, militaryValue: 80 },
  { name: 'Kırıkkale', code: 'TR-71', type: 'INDUSTRIAL' as const, svgPathId: 'tr-71', economicValue: 110, militaryValue: 120 },
  { name: 'Batman', code: 'TR-72', type: 'INDUSTRIAL' as const, svgPathId: 'tr-72', economicValue: 120, militaryValue: 110 },
  { name: 'Şırnak', code: 'TR-73', type: 'MILITARY' as const, svgPathId: 'tr-73', economicValue: 60, militaryValue: 150 },
  { name: 'Bartın', code: 'TR-74', type: 'COASTAL' as const, svgPathId: 'tr-74', economicValue: 80, militaryValue: 85 },
  { name: 'Ardahan', code: 'TR-75', type: 'MILITARY' as const, svgPathId: 'tr-75', economicValue: 55, militaryValue: 140 },
  { name: 'Iğdır', code: 'TR-76', type: 'MILITARY' as const, svgPathId: 'tr-76', economicValue: 60, militaryValue: 120 },
  { name: 'Yalova', code: 'TR-77', type: 'COASTAL' as const, svgPathId: 'tr-77', economicValue: 120, militaryValue: 90 },
  { name: 'Karabük', code: 'TR-78', type: 'INDUSTRIAL' as const, svgPathId: 'tr-78', economicValue: 100, militaryValue: 100, specialResource: 'iron' },
  { name: 'Kilis', code: 'TR-79', type: 'MILITARY' as const, svgPathId: 'tr-79', economicValue: 70, militaryValue: 110 },
  { name: 'Osmaniye', code: 'TR-80', type: 'AGRICULTURE' as const, svgPathId: 'tr-80', economicValue: 90, militaryValue: 90 },
  { name: 'Düzce', code: 'TR-81', type: 'COASTAL' as const, svgPathId: 'tr-81', economicValue: 95, militaryValue: 90 },
];

async function main() {
  console.log('🌱 Seed başlatılıyor...');

  // Upsert all 81 regions
  for (const region of REGIONS) {
    await prisma.region.upsert({
      where: { code: region.code },
      update: {},
      create: {
        name: region.name,
        code: region.code,
        type: region.type,
        svgPathId: region.svgPathId,
        economicValue: region.economicValue,
        militaryValue: region.militaryValue,
        specialResource: region.specialResource ?? null,
        stats: {
          create: {
            taxRate: 10,
            defenseLevel: 1,
          },
        },
      },
    });
  }

  console.log(`✅ ${REGIONS.length} il oluşturuldu`);
  console.log('🎉 Seed tamamlandı');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
