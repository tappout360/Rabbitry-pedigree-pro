export const BREED_STANDARDS = {
  'Holland Lop': {
    name: 'Holland Lop',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 48, buckSrMin: 32, buckSrMax: 64, // max 4.0 lbs (64 oz), Senior min 2.0 lbs (32 oz)
    doeJrMin: 0, doeJrMax: 48, doeSrMin: 32, doeSrMax: 64
  },
  'Netherland Dwarf': {
    name: 'Netherland Dwarf',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 32, buckSrMin: 16, buckSrMax: 40, // max 2.5 lbs (40 oz), Senior min 1.0 lbs (16 oz)
    doeJrMin: 0, doeJrMax: 32, doeSrMin: 16, doeSrMax: 40
  },
  'Flemish Giant': {
    name: 'Flemish Giant',
    classType: '6-class',
    buckJrMin: 0, buckJrMax: 160, buckIntMin: 144, buckIntMax: 192, buckSrMin: 208, buckSrMax: 9999, // Sr Bucks min 13 lbs (208 oz)
    doeJrMin: 0, doeJrMax: 176, doeIntMin: 160, doeIntMax: 208, doeSrMin: 224, doeSrMax: 9999    // Sr Does min 14 lbs (224 oz)
  },
  'New Zealand': {
    name: 'New Zealand',
    classType: '6-class',
    buckJrMin: 0, buckJrMax: 128, buckIntMin: 112, buckIntMax: 144, buckSrMin: 144, buckSrMax: 176, // Sr Bucks 9-11 lbs (144-176 oz)
    doeJrMin: 0, doeJrMax: 144, doeIntMin: 128, doeIntMax: 160, doeSrMin: 160, doeSrMax: 192    // Sr Does 10-12 lbs (160-192 oz)
  },
  'Californian': {
    name: 'Californian',
    classType: '6-class',
    buckJrMin: 88, buckJrMax: 128, buckIntMin: 0, buckIntMax: 144, buckSrMin: 144, buckSrMax: 160, // Jr 5.5-8 lbs, Int max 9 lbs, Sr 9-10 lbs
    doeJrMin: 88, doeJrMax: 136, doeIntMin: 0, doeIntMax: 152, doeSrMin: 152, doeSrMax: 168     // Jr 5.5-8.5 lbs, Int max 9.5 lbs, Sr 9.5-10.5 lbs
  },
  'Mini Rex': {
    name: 'Mini Rex',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 52, buckSrMin: 48, buckSrMax: 68, // Jr max 3.25 lbs, Sr Bucks 3-4.25 lbs
    doeJrMin: 0, doeJrMax: 52, doeSrMin: 52, doeSrMax: 72  // Jr max 3.25 lbs, Sr Does 3.25-4.5 lbs
  },
  'Mini Lop': {
    name: 'Mini Lop',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 72, buckSrMin: 72, buckSrMax: 104, // Jr max 4.5 lbs, Sr 4.5-6.5 lbs
    doeJrMin: 0, doeJrMax: 72, doeSrMin: 72, doeSrMax: 104
  },
  'Dutch': {
    name: 'Dutch',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 56, buckSrMin: 56, buckSrMax: 88, // Jr max 3.5 lbs, Sr 3.5-5.5 lbs
    doeJrMin: 0, doeJrMax: 56, doeSrMin: 56, doeSrMax: 88
  },
  'Rex': {
    name: 'Rex',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 128, buckSrMin: 120, buckSrMax: 152, // Jr max 8 lbs, Sr Bucks 7.5-9.5 lbs
    doeJrMin: 0, doeJrMax: 128, doeSrMin: 128, doeSrMax: 168   // Jr max 8 lbs, Sr Does 8-10.5 lbs
  },
  'Lionhead': {
    name: 'Lionhead',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 52, buckSrMin: 40, buckSrMax: 60, // Jr max 3.25 lbs, Sr 2.5-3.75 lbs
    doeJrMin: 0, doeJrMax: 52, doeSrMin: 40, doeSrMax: 60
  },
  'Jersey Wooly': {
    name: 'Jersey Wooly',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 48, buckSrMin: 32, buckSrMax: 56, // Jr max 3 lbs, Sr 2-3.5 lbs (ideal 3 lbs)
    doeJrMin: 0, doeJrMax: 48, doeSrMin: 32, doeSrMax: 56
  },
  'French Lop': {
    name: 'French Lop',
    classType: '6-class',
    buckJrMin: 0, buckJrMax: 168, buckIntMin: 0, buckIntMax: 184, buckSrMin: 168, buckSrMax: 9999, // Sr Bucks min 10.5 lbs (168 oz)
    doeJrMin: 0, doeJrMax: 168, doeIntMin: 0, doeIntMax: 184, doeSrMin: 176, doeSrMax: 9999     // Sr Does min 11 lbs (176 oz)
  },
  'Champagne d\'Argent': {
    name: 'Champagne d\'Argent',
    classType: '6-class',
    buckJrMin: 0, buckJrMax: 144, buckIntMin: 0, buckIntMax: 160, buckSrMin: 144, buckSrMax: 176, // Jr max 9 lbs, Sr 9-11 lbs
    doeJrMin: 0, doeJrMax: 144, doeIntMin: 0, doeIntMax: 168, doeSrMin: 152, doeSrMax: 192     // Jr max 9 lbs, Sr 9.5-12 lbs
  },
  'English Angora': {
    name: 'English Angora',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 88, buckSrMin: 80, buckSrMax: 120, // Jr max 5.5 lbs, Sr 5-7.5 lbs
    doeJrMin: 0, doeJrMax: 88, doeSrMin: 80, doeSrMax: 120
  },
  'Satin': {
    name: 'Satin',
    classType: '6-class',
    buckJrMin: 0, buckJrMax: 128, buckIntMin: 0, buckIntMax: 144, buckSrMin: 136, buckSrMax: 168, // Jr max 8 lbs, Int max 9 lbs, Sr Bucks 8.5-10.5 lbs
    doeJrMin: 0, doeJrMax: 128, doeIntMin: 0, doeIntMax: 144, doeSrMin: 144, doeSrMax: 176     // Jr max 8 lbs, Int max 9 lbs, Sr Does 9-11 lbs
  },
  'Havana': {
    name: 'Havana',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 80, buckSrMin: 72, buckSrMax: 104, // Jr max 5 lbs, Sr 4.5-6.5 lbs
    doeJrMin: 0, doeJrMax: 80, doeSrMin: 72, doeSrMax: 104
  },
  'Himalayan': {
    name: 'Himalayan',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 40, buckSrMin: 40, buckSrMax: 72, // Jr max 2.5 lbs, Sr 2.5-4.5 lbs
    doeJrMin: 0, doeJrMax: 40, doeSrMin: 40, doeSrMax: 72
  },
  'Polish': {
    name: 'Polish',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 40, buckSrMin: 0, buckSrMax: 56,  // Jr max 2.5 lbs, Sr max 3.5 lbs
    doeJrMin: 0, doeJrMax: 40, doeSrMin: 0, doeSrMax: 56
  },
  'Thrianta': {
    name: 'Thrianta',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 80, buckSrMin: 64, buckSrMax: 96,  // Jr max 5 lbs, Sr 4-6 lbs
    doeJrMin: 0, doeJrMax: 80, doeSrMin: 64, doeSrMax: 96
  },
  'Silver Marten': {
    name: 'Silver Marten',
    classType: '4-class',
    buckJrMin: 0, buckJrMax: 104, buckSrMin: 104, buckSrMax: 136, // Jr max 6.5 lbs, Sr Bucks 6.5-8.5 lbs
    doeJrMin: 0, doeJrMax: 104, doeSrMin: 112, doeSrMax: 152   // Jr max 6.5 lbs, Sr Does 7-9.5 lbs
  }
};
