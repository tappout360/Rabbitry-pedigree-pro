export const BREED_COLORS = {
  'New Zealand': [
    { name: 'White', hex: '#FFFFFF', border: '#D0D3D4' },
    { name: 'Red', hex: '#D35400' },
    { name: 'Black', hex: '#1A1A1A' },
    { name: 'Blue', hex: '#566573' },
    { name: 'Broken Red', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #D35400 6px, #D35400 12px)' },
    { name: 'Broken Black', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #1A1A1A 6px, #1A1A1A 12px)' },
    { name: 'Broken Blue', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #566573 6px, #566573 12px)' }
  ],
  'Holland Lop': [
    { name: 'Blue', hex: '#566573' },
    { name: 'Broken Blue', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #566573 6px, #566573 12px)' },
    { name: 'Black', hex: '#1A1A1A' },
    { name: 'Sable Point', hex: '#EEDAC2' },
    { name: 'Tortoise', hex: '#BA7A44' },
    { name: 'Orange', hex: '#EB984E' },
    { name: 'Broken Tortoise', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #BA7A44 6px, #BA7A44 12px)' }
  ],
  'Mini Rex': [
    { name: 'Castor', hex: '#875A38' },
    { name: 'Opal', hex: '#A6ACAF' },
    { name: 'Black', hex: '#1A1A1A' },
    { name: 'Blue', hex: '#566573' },
    { name: 'Chinchilla', hex: '#BDC3C7' },
    { name: 'Red', hex: '#D35400' },
    { name: 'White', hex: '#FFFFFF', border: '#D0D3D4' },
    { name: 'Broken Castor', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #875A38 6px, #875A38 12px)' }
  ],
  'Netherland Dwarf': [
    { name: 'Black', hex: '#1A1A1A' },
    { name: 'Blue', hex: '#566573' },
    { name: 'Ruby Eyed White', hex: '#FFFFFF', border: '#FADBD8' }, // Red eyes border
    { name: 'Blue Eyed White', hex: '#FFFFFF', border: '#D4E6F1' }, // Blue eyes border
    { name: 'Sable Point', hex: '#EEDAC2' },
    { name: 'Chestnut', hex: '#6E4E37' },
    { name: 'Otter', hex: '#4A3B32' }
  ],
  'Flemish Giant': [
    { name: 'Sandy', hex: '#C39B78' },
    { name: 'Fawn', hex: '#E5C299' },
    { name: 'White', hex: '#FFFFFF', border: '#D0D3D4' },
    { name: 'Black', hex: '#1A1A1A' },
    { name: 'Blue', hex: '#566573' },
    { name: 'Light Gray', hex: '#BDC3C7' },
    { name: 'Steel Gray', hex: '#7F8C8D' }
  ],
  'Californian': [
    { name: 'Standard (White w/ Point)', hex: '#FFFFFF', border: '#1A1A1A' } // Black nose/ears point
  ],
  'Lionhead': [
    { name: 'Tortoise', hex: '#BA7A44' },
    { name: 'Ruby Eyed White', hex: '#FFFFFF', border: '#FADBD8' },
    { name: 'Black', hex: '#1A1A1A' },
    { name: 'Sable Point', hex: '#EEDAC2' },
    { name: 'Chocolate', hex: '#5C3A21' }
  ],
  'Mini Lop': [
    { name: 'Black', hex: '#1A1A1A' },
    { name: 'Blue', hex: '#566573' },
    { name: 'Chestnut Agouti', hex: '#6E4E37' },
    { name: 'Chinchilla', hex: '#BDC3C7' },
    { name: 'Opal', hex: '#A6ACAF' },
    { name: 'Orange', hex: '#EB984E' },
    { name: 'Tortoise', hex: '#BA7A44' },
    { name: 'Broken', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #CCCCCC 6px, #CCCCCC 12px)' }
  ],
  'Dutch': [
    { name: 'Black & White', hex: 'linear-gradient(90deg, #1A1A1A 50%, #FFFFFF 50%)' },
    { name: 'Blue & White', hex: 'linear-gradient(90deg, #566573 50%, #FFFFFF 50%)' },
    { name: 'Chocolate & White', hex: 'linear-gradient(90deg, #5C3A21 50%, #FFFFFF 50%)' },
    { name: 'Gray & White', hex: 'linear-gradient(90deg, #7F8C8D 50%, #FFFFFF 50%)' },
    { name: 'Steel & White', hex: 'linear-gradient(90deg, #34495E 50%, #FFFFFF 50%)' },
    { name: 'Tortoise & White', hex: 'linear-gradient(90deg, #BA7A44 50%, #FFFFFF 50%)' }
  ],
  'Default': [
    { name: 'White', hex: '#FFFFFF', border: '#D0D3D4' },
    { name: 'Black', hex: '#1A1A1A' },
    { name: 'Blue', hex: '#566573' },
    { name: 'Red', hex: '#D35400' },
    { name: 'Fawn', hex: '#E5C299' },
    { name: 'Chocolate', hex: '#5C3A21' },
    { name: 'Lilac', hex: '#D7BDE2' },
    { name: 'Broken', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #CCCCCC 6px, #CCCCCC 12px)' }
  ]
};

export const BREED_VARIETY_GROUPS = {
  'Netherland Dwarf': {
    'Self': [
      { name: 'Black', hex: '#1A1A1A', sop: 'Rich uniform black. Eyes dark brown.' },
      { name: 'Blue', hex: '#566573', sop: 'Medium blue. Eyes blue-gray.' },
      { name: 'Chocolate', hex: '#5C3A21', sop: 'Rich dark chocolate. Eyes brown.' },
      { name: 'Lilac', hex: '#D7BDE2', sop: 'Dove gray with pink tint. Eyes blue-gray.' },
      { name: 'Ruby Eyed White', hex: '#FFFFFF', border: '#FADBD8', sop: 'Pure white. Eyes ruby red.' },
      { name: 'Blue Eyed White', hex: '#FFFFFF', border: '#D4E6F1', sop: 'Pure white. Eyes blue.' }
    ],
    'Shaded': [
      { name: 'Sable Point', hex: '#EEDAC2', sop: 'Rich sepia brown on points, shading to creamy body. Eyes brown.' },
      { name: 'Siamese Sable', hex: '#7D6608', sop: 'Sepia brown fading to lighter brown. Eyes brown.' },
      { name: 'Siamese Smoke Pearl', hex: '#85929E', sop: 'Smoke gray shading to pearl gray. Eyes blue-gray.' }
    ],
    'Agouti': [
      { name: 'Chestnut', hex: '#6E4E37', sop: 'Agouti banding: black, tan, slate. Eyes brown.' },
      { name: 'Opal', hex: '#A6ACAF', sop: 'Agouti banding: blue, tan, slate. Eyes blue-gray.' },
      { name: 'Chinchilla', hex: '#BDC3C7', sop: 'Agouti banding: black, pearl, slate. Eyes brown.' }
    ],
    'Tan Pattern': [
      { name: 'Otter', hex: '#4A3B32', sop: 'Black body with tan markings on chest, neck, belly. Eyes brown.' },
      { name: 'Silver Marten', hex: '#34495E', sop: 'Black body with silver/white markings. Eyes brown.' }
    ]
  },
  'Holland Lop': {
    'Self': [
      { name: 'Black', hex: '#1A1A1A', sop: 'Rich uniform black.' },
      { name: 'Blue', hex: '#566573', sop: 'Medium blue.' },
      { name: 'Chocolate', hex: '#5C3A21', sop: 'Rich dark chocolate.' },
      { name: 'White (REW)', hex: '#FFFFFF', border: '#FADBD8', sop: 'Pure white. Ruby eyes.' }
    ],
    'Shaded': [
      { name: 'Sable Point', hex: '#EEDAC2', sop: 'Sepia points shading to creamy body.' },
      { name: 'Seal', hex: '#2C3E50', sop: 'Dark sepia brown near black.' }
    ],
    'Wide Band / Agouti': [
      { name: 'Orange', hex: '#EB984E', sop: 'Bright orange shading to cream belly.' },
      { name: 'Tortoise', hex: '#BA7A44', sop: 'Rich orange shading to dark smoky tail/sides.' },
      { name: 'Chestnut Agouti', hex: '#6E4E37', sop: 'Banded agouti chestnut.' }
    ],
    'Broken': [
      { name: 'Broken Blue', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #566573 6px, #566573 12px)', sop: 'White with blue patches.' },
      { name: 'Broken Tortoise', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #BA7A44 6px, #BA7A44 12px)', sop: 'White with tortoise patches.' }
    ]
  },
  'New Zealand': {
    'Standard': [
      { name: 'White', hex: '#FFFFFF', border: '#D0D3D4', sop: 'Pure white body with pink eyes.' },
      { name: 'Red', hex: '#D35400', sop: 'Bright reddish sorrel.' },
      { name: 'Black', hex: '#1A1A1A', sop: 'Uniform jet black.' },
      { name: 'Blue', hex: '#566573', sop: 'Rich medium blue.' }
    ],
    'Broken': [
      { name: 'Broken Red', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #D35400 6px, #D35400 12px)', sop: 'White with red patches.' },
      { name: 'Broken Black', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #1A1A1A 6px, #1A1A1A 12px)', sop: 'White with black patches.' },
      { name: 'Broken Blue', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #566573 6px, #566573 12px)', sop: 'White with blue patches.' }
    ]
  },
  'Mini Rex': {
    'Self': [
      { name: 'Black', hex: '#1A1A1A', sop: 'Solid lustrous black. Eyes dark brown.' },
      { name: 'Blue', hex: '#566573', sop: 'Rich dark blue. Eyes blue-gray.' },
      { name: 'Chocolate', hex: '#5C3A21', sop: 'Rich chocolate brown. Eyes brown.' },
      { name: 'Lilac', hex: '#D7BDE2', sop: 'Dove gray with pink tint. Eyes blue-gray.' },
      { name: 'White', hex: '#FFFFFF', border: '#D0D3D4', sop: 'Pure snow white. Eyes ruby red.' }
    ],
    'Shaded': [
      { name: 'Sable', hex: '#7D6608', sop: 'Rich sepia brown shading to lighter flanks.' },
      { name: 'Seal', hex: '#2C3E50', sop: 'Dark sepia brown near black.' },
      { name: 'Tortoise', hex: '#BA7A44', sop: 'Orange body shading to dark points.' }
    ],
    'Agouti': [
      { name: 'Castor', hex: '#875A38', sop: 'Banded agouti: dark slate, rich orange-red, black ticking.' },
      { name: 'Opal', hex: '#A6ACAF', sop: 'Banded agouti: slate, cream, blue ticking.' },
      { name: 'Chinchilla', hex: '#BDC3C7', sop: 'Banded agouti: slate, pearl white, black ticking.' }
    ],
    'Broken': [
      { name: 'Broken Castor', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #875A38 6px, #875A38 12px)', sop: 'White with castor patches.' },
      { name: 'Broken Black', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #1A1A1A 6px, #1A1A1A 12px)', sop: 'White with black patches.' }
    ]
  },
  'Californian': {
    'Standard': [
      { name: 'Standard (White w/ Points)', hex: '#FFFFFF', border: '#1A1A1A', sop: 'Pure white body with dark sepia/black points on nose, ears, feet, tail. Eyes pink.' }
    ]
  },
  'Abyssinian': {
    'Self': [
      { name: 'Black', hex: '#1A1A1A', sop: 'Uniform deep black.' },
      { name: 'Red', hex: '#D35400', sop: 'Bright cherry red.' },
      { name: 'White', hex: '#FFFFFF', border: '#D0D3D4', sop: 'Pure white. Eyes dark or pink.' },
      { name: 'Cream', hex: '#F9E79F', sop: 'Clean cream. Eyes dark.' }
    ],
    'Agouti': [
      { name: 'Golden Agouti', hex: '#875A38', sop: 'Rich golden red base with black ticking.' },
      { name: 'Silver Agouti', hex: '#A6ACAF', sop: 'Silver white base with black ticking.' }
    ],
    'Marked': [
      { name: 'Broken Color', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #CCCCCC 6px, #CCCCCC 12px)', sop: 'Two or more distinct colors.' },
      { name: 'Tortoiseshell', hex: 'repeating-linear-gradient(45deg, #1A1A1A, #1A1A1A 6px, #D35400 6px, #D35400 12px)', sop: 'Alternating patches of black and red.' }
    ]
  },
  'American': {
    'Self': [
      { name: 'Black', hex: '#1A1A1A', sop: 'Deep jet black.' },
      { name: 'Red', hex: '#D35400', sop: 'Cherry red.' },
      { name: 'White', hex: '#FFFFFF', border: '#D0D3D4', sop: 'Pure snow white.' }
    ],
    'Agouti': [
      { name: 'Golden Agouti', hex: '#875A38', sop: 'Rich golden base with black ticking.' }
    ]
  },
  'Peruvian': {
    'Self': [
      { name: 'Black', hex: '#1A1A1A', sop: 'Jet black long coat.' },
      { name: 'White', hex: '#FFFFFF', border: '#D0D3D4', sop: 'Snow white long coat.' }
    ],
    'Marked': [
      { name: 'Broken Color', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #CCCCCC 6px, #CCCCCC 12px)', sop: 'Broken patches of color.' }
    ]
  },
  'Default': {
    'Self / Standard': [
      { name: 'White', hex: '#FFFFFF', border: '#D0D3D4', sop: 'Standard white.' },
      { name: 'Black', hex: '#1A1A1A', sop: 'Standard black.' },
      { name: 'Blue', hex: '#566573', sop: 'Standard blue.' },
      { name: 'Red', hex: '#D35400', sop: 'Standard red.' },
      { name: 'Chocolate', hex: '#5C3A21', sop: 'Standard chocolate.' },
      { name: 'Broken', hex: 'repeating-linear-gradient(45deg, #FFFFFF, #FFFFFF 6px, #CCCCCC 6px, #CCCCCC 12px)', sop: 'Standard broken.' }
    ]
  }
};
