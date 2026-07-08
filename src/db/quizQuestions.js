// Seeded Quiz Questions for WarrenWise Academy
// Levels: Beginner/Novice, Junior, Senior
// Categories: Anatomy, Breed Standards, Showmanship, Show Rules, Care & Health, 4-H Values

export const QUIZ_QUESTIONS = [
  // === BEGINNER / NOVICE LEVEL ===
  // Category: Anatomy
  {
    id: "q-beg-anat-1",
    level: "Beginner",
    category: "Anatomy",
    type: "multiple-choice",
    question: "How many teeth does a rabbit have in total?",
    options: ["4", "12", "28", "32"],
    answer: "28",
    explanation: "Rabbits have 28 teeth. They have 4 incisors at the top (including 2 tiny peg teeth behind the main incisors), 2 on the bottom, and 22 cheek teeth (molars and premolars)."
  },
  {
    id: "q-beg-anat-2",
    level: "Beginner",
    category: "Anatomy",
    type: "true-false",
    question: "A rabbit's claws should never be trimmed.",
    options: ["True", "False"],
    answer: "False",
    explanation: "Rabbits' nails grow continuously, just like ours! You should trim them regularly to keep them comfortable and prevent them from snagging on cages."
  },
  {
    id: "q-beg-anat-3",
    level: "Beginner",
    category: "Anatomy",
    type: "multiple-choice",
    question: "Where is the dewlap located on a rabbit?",
    options: ["Under the chin", "On the tail", "On the hind leg", "Behind the ears"],
    answer: "Under the chin",
    explanation: "The dewlap is the fold of loose skin under a rabbit's chin, which is especially prominent in adult female rabbits (does)."
  },
  {
    id: "q-beg-anat-4",
    level: "Beginner",
    category: "Anatomy",
    type: "multiple-choice",
    question: "What is the collective term for a rabbit's nose and mouth area?",
    options: ["Flank", "Muzzle", "Loin", "Crown"],
    answer: "Muzzle",
    explanation: "The muzzle comprises the nose, mouth, and whisker pads of the rabbit."
  },
  {
    id: "q-beg-anat-5",
    level: "Beginner",
    category: "Anatomy",
    type: "true-false",
    question: "A rabbit's whiskers help them navigate in dark spaces.",
    options: ["True", "False"],
    answer: "True",
    explanation: "Yes! Whiskers (vibrissae) are highly sensitive touch organs that help rabbits feel the width of tunnels and navigate in the dark."
  },
  // Category: 4-H Values
  {
    id: "q-beg-4h-1",
    level: "Beginner",
    category: "4-H Values",
    type: "multiple-choice",
    question: "What are the four H's of 4-H?",
    options: [
      "Home, Hobby, Hope, Honor",
      "Head, Heart, Hands, Health",
      "Hustle, Help, Hugs, Happiness",
      "History, Horse, Heritage, Harvest"
    ],
    answer: "Head, Heart, Hands, Health",
    explanation: "The 4 H's stand for Head (clearer thinking), Heart (greater loyalty), Hands (larger service), and Health (better living)."
  },
  {
    id: "q-beg-4h-2",
    level: "Beginner",
    category: "4-H Values",
    type: "multiple-choice",
    question: "What is the official 4-H motto?",
    options: [
      "To Make the Best Better",
      "Always Ready, Always Prepared",
      "Learning by Doing",
      "Fun, Friends, and Family"
    ],
    answer: "To Make the Best Better",
    explanation: "The official 4-H motto is 'To Make the Best Better,' encouraging youth to always strive for self-improvement and excellence."
  },
  {
    id: "q-beg-4h-3",
    level: "Beginner",
    category: "4-H Values",
    type: "multiple-choice",
    question: "What color is the official 4-H emblem (clover)?",
    options: ["Red and Gold", "Green and White", "Blue and Silver", "Purple and Yellow"],
    answer: "Green and White",
    explanation: "The 4-H emblem is a green four-leaf clover with a white letter 'H' on each leaf."
  },
  // Category: Care & Health
  {
    id: "q-beg-care-1",
    level: "Beginner",
    category: "Care & Health",
    type: "multiple-choice",
    question: "What should make up the largest part of a rabbit's daily diet?",
    options: ["Carrots", "Grass Hay (like Timothy Hay)", "Pellets", "Fruit Treats"],
    answer: "Grass Hay (like Timothy Hay)",
    explanation: "Fresh grass hay should make up at least 80% of a rabbit's diet. It is essential for keeping their digestive system moving and wearing down their teeth."
  },
  {
    id: "q-beg-care-2",
    level: "Beginner",
    category: "Care & Health",
    type: "true-false",
    question: "Rabbits sweat through their skin to stay cool in hot weather.",
    options: ["True", "False"],
    answer: "False",
    explanation: "Rabbits cannot sweat! Instead, they regulate their temperature through their large ears, which release heat. Keep them cool in hot temperatures!"
  },
  {
    id: "q-beg-care-3",
    level: "Beginner",
    category: "Care & Health",
    type: "multiple-choice",
    question: "What is the term for a rabbit's enclosure or home?",
    options: ["Saddle", "Hutch", "Nestbox", "Stall"],
    answer: "Hutch",
    explanation: "A hutch is the traditional word for a rabbit's outdoor or indoor cage structure."
  },
  {
    id: "q-beg-care-4",
    level: "Beginner",
    category: "Care & Health",
    type: "multiple-choice",
    question: "How often should you provide fresh, clean water to your rabbit?",
    options: ["Every day", "Every week", "Only when the bowl is empty", "Every other day"],
    answer: "Every day",
    explanation: "Fresh water must be provided every single day. Rabbits drink a surprising amount of water and need it for their digestion."
  },
  // Category: Showmanship
  {
    id: "q-beg-show-1",
    level: "Beginner",
    category: "Showmanship",
    type: "multiple-choice",
    question: "How should you carry a rabbit safely to the show table?",
    options: [
      "By its ears",
      "By its hind legs",
      "In the 'football carry' supporting the hindquarters and body",
      "By the scruff of the neck alone"
    ],
    answer: "In the 'football carry' supporting the hindquarters and body",
    explanation: "Always support the rabbit's rear! Tuck the head under your arm and support their feet/hindquarters with your arm and hand, holding the scruff lightly for control."
  },
  {
    id: "q-beg-show-2",
    level: "Beginner",
    category: "Showmanship",
    type: "true-false",
    question: "It is okay to talk loudly or run around the show tables during a rabbit show.",
    options: ["True", "False"],
    answer: "False",
    explanation: "Loud noises and running can scare the rabbits and distract the judges. Always walk quietly and speak softly at the show."
  },

  // === JUNIOR LEVEL ===
  // Category: Anatomy
  {
    id: "q-jun-anat-1",
    level: "Junior",
    category: "Anatomy",
    type: "multiple-choice",
    question: "Which term describes a misalignment of the teeth where the top incisors sit behind the bottom ones?",
    options: ["Malocclusion (Sore Mouth)", "Sore Hocks", "Ear Canker", "Molt"],
    answer: "Malocclusion (Sore Mouth)",
    explanation: "Malocclusion (also known as buck teeth or wolf teeth) is a genetic defect where the incisors fail to align properly, preventing them from wearing down."
  },
  {
    id: "q-jun-anat-2",
    level: "Junior",
    category: "Anatomy",
    type: "multiple-choice",
    question: "What is the bone structure connecting the rabbit's skull to the shoulder area called?",
    options: ["Loin", "Crown", "Neck", "Hock"],
    answer: "Neck",
    explanation: "The neck connects the skull to the shoulders. In some breeds, like Lops, the top of the head area is referred to as the crown."
  },
  {
    id: "q-jun-anat-3",
    level: "Junior",
    category: "Anatomy",
    type: "multiple-choice",
    question: "How many toes does a rabbit have on its front feet?",
    options: ["4", "5", "6", "8"],
    answer: "5",
    explanation: "Rabbits have 5 toes on each front foot (including the dewclaw) and 4 toes on each hind foot, making 18 toes in total."
  },
  // Category: Breed Standards
  {
    id: "q-jun-breed-1",
    level: "Junior",
    category: "Breed Standards",
    type: "multiple-choice",
    question: "Which body type does the Holland Lop belong to?",
    options: ["Semi-Arch", "Compact", "Commercial", "Cylindrical"],
    answer: "Compact",
    explanation: "The Holland Lop has a Compact body type. There are five body types recognized by ARBA: Compact, Commercial, Cylindrical, Semi-Arch, and Full-Arch."
  },
  {
    id: "q-jun-breed-2",
    level: "Junior",
    category: "Breed Standards",
    type: "multiple-choice",
    question: "What is the maximum weight allowed for a Netherland Dwarf in an ARBA show?",
    options: ["2.5 lbs (40 oz)", "4.0 lbs (64 oz)", "6.5 lbs (104 oz)", "9.5 lbs (152 oz)"],
    answer: "2.5 lbs (40 oz)",
    explanation: "The Netherland Dwarf senior weight limit is 2.5 pounds (40 ounces), making it one of the smallest compact breeds."
  },
  {
    id: "q-jun-breed-3",
    level: "Junior",
    category: "Breed Standards",
    type: "multiple-choice",
    question: "Which of the following is a 6-class breed?",
    options: ["Mini Rex", "Holland Lop", "New Zealand", "Dutch"],
    answer: "New Zealand",
    explanation: "New Zealands are 6-class breeds because they are larger commercial rabbits with Intermediate classes. Mini Rex, Holland Lop, and Dutch are smaller 4-class breeds."
  },
  // Category: Showmanship
  {
    id: "q-jun-show-1",
    level: "Junior",
    category: "Showmanship",
    type: "multiple-choice",
    question: "When presenting your rabbit's teeth to the judge, what should you do?",
    options: [
      "Pry the mouth open with your finger",
      "Pull the lips back gently using your index and middle fingers of one hand",
      "Let the judge open the mouth",
      "Open the jaws from the sides"
    ],
    answer: "Pull the lips back gently using your index and middle fingers of one hand",
    explanation: "Using one hand over the muzzle, peel back the top and bottom lips using your index and middle fingers to show the incisors clearly without hurting the rabbit."
  },
  {
    id: "q-jun-show-2",
    level: "Junior",
    category: "Showmanship",
    type: "multiple-choice",
    question: "In what order should a showmanship exhibitor examine the rabbit?",
    options: [
      "Nose, Ears, Eyes, Teeth, Body, Legs, Tail",
      "Tail first, then head",
      "Any order they feel like",
      "Exhibitor's choice as long as they cover everything"
    ],
    answer: "Nose, Ears, Eyes, Teeth, Body, Legs, Tail",
    explanation: "Showmanship exams generally go from head-to-tail: check nose/eyes/ears/teeth, inspect body/fur, turn over to check stomach/vent/legs/toes, and check tail/rear."
  },
  // Category: Show Rules
  {
    id: "q-jun-rules-1",
    level: "Junior",
    category: "Show Rules",
    type: "multiple-choice",
    question: "What constitutes a 'Grand Champion Leg' in ARBA shows?",
    options: [
      "A rabbit winning Best in Show",
      "A certificate awarded for winning a class of at least 5 rabbits from 3 different breeders",
      "Any first-place ribbon",
      "Winning a breeding show entry"
    ],
    answer: "A certificate awarded for winning a class of at least 5 rabbits from 3 different breeders",
    explanation: "To win a leg, the class must contain at least 5 rabbits exhibited by at least 3 different breeders. A rabbit needs 3 legs under 2 different judges to apply for Grand Champion status."
  },
  {
    id: "q-jun-rules-2",
    level: "Junior",
    category: "Show Rules",
    type: "multiple-choice",
    question: "What is the minimum age for a junior class rabbit in a 4-class breed?",
    options: ["3 months", "8 weeks (minimum legal sale/exhibition age)", "6 months", "4 months"],
    answer: "8 weeks (minimum legal sale/exhibition age)",
    explanation: "Under ARBA rules, no rabbit under 8 weeks of age can be brought to or exhibited at a show. Junior classes are for rabbits under 6 months old."
  },
  // Category: Care & Health
  {
    id: "q-jun-care-1",
    level: "Junior",
    category: "Care & Health",
    type: "multiple-choice",
    question: "What parasite causes flaky skin and hair loss around the neck, shoulders, or ears?",
    options: ["Ear Canker Mites", "Fur Mites (Cheyletiella)", "Sore Hocks", "Coccidiosis"],
    answer: "Fur Mites (Cheyletiella)",
    explanation: "Fur mites cause dandruff and hair loss, often called 'walking dandruff'. It can be treated with rabbit-safe anti-parasitics."
  },
  {
    id: "q-jun-care-2",
    level: "Junior",
    category: "Care & Health",
    type: "multiple-choice",
    question: "Which vitamin is synthesized in a rabbit's cecum and absorbed through cecotrophy?",
    options: ["Vitamin C", "Vitamin D", "B Vitamins (specifically B12)", "Vitamin A"],
    answer: "B Vitamins (specifically B12)",
    explanation: "Cecotropes are special nutrient-rich night droppings containing high amounts of B-complex vitamins, protein, and friendly microbes that rabbits re-ingest directly."
  },

  // === SENIOR LEVEL ===
  // Category: Anatomy
  {
    id: "q-sen-anat-1",
    level: "Senior",
    category: "Anatomy",
    type: "multiple-choice",
    question: "What is the proper scientific name for the double teeth located directly behind the upper incisors?",
    options: ["Wolf teeth", "Peg teeth (duplicate incisors)", "Deciduous molars", "Canines"],
    answer: "Peg teeth (duplicate incisors)",
    explanation: "Rabbits have duplicate upper incisors known as peg teeth. They sit directly behind the primary upper incisors."
  },
  {
    id: "q-sen-anat-2",
    level: "Senior",
    category: "Anatomy",
    type: "multiple-choice",
    question: "Which muscle group is checked for density and thickness during the loin assessment?",
    options: ["Biceps femoris", "Longissimus dorsi", "Gastrocnemius", "Masseter"],
    answer: "Longissimus dorsi",
    explanation: "The loin meat is primarily the longissimus dorsi muscle, running along the spine. Good commercial type requires thick, wide, and deep loins."
  },
  // Category: Breed Standards
  {
    id: "q-sen-breed-1",
    level: "Senior",
    category: "Breed Standards",
    type: "multiple-choice",
    question: "Which of the following is one of the only breeds to feature a 'Cylindrical' body type?",
    options: ["Flemish Giant", "Himalayan", "English Spot", "Beveren"],
    answer: "Himalayan",
    explanation: "The Himalayan is the only cylindrical breed. They should be long, snaky, and sit flat on the table, resembling a long tube."
  },
  {
    id: "q-sen-breed-2",
    level: "Senior",
    category: "Breed Standards",
    type: "multiple-choice",
    question: "How many recognized breeds of rabbits are currently recognized by the American Rabbit Breeders Association (ARBA)?",
    options: ["42", "49", "53", "55"],
    answer: "53",
    explanation: "ARBA currently recognizes 53 distinct breeds of rabbits, each with its own specific Standard of Perfection."
  },
  // Category: Showmanship
  {
    id: "q-sen-show-1",
    level: "Senior",
    category: "Showmanship",
    type: "multiple-choice",
    question: "During a showmanship examination, what must you do immediately after checking the sex of the rabbit?",
    options: [
      "Put the rabbit down and pose it",
      "Check the surrounding groin area for signs of vent disease (spirochetosis)",
      "Check the hind toenails",
      "Turn the rabbit right side up"
    ],
    answer: "Check the surrounding groin area for signs of vent disease (spirochetosis)",
    explanation: "Checking the sex and vent area occurs together. You check the sex first, then immediately inspect the vent and surrounding groin tissue for blisters, redness, or scabs indicating vent disease."
  },
  // Category: Show Rules
  {
    id: "q-sen-rules-1",
    level: "Senior",
    category: "Show Rules",
    type: "multiple-choice",
    question: "What is the difference between a Disqualification (DQ) and an Elimination in an ARBA show?",
    options: [
      "There is no difference.",
      "A DQ is for genetic or structural defects and stays on the rabbit's record; an Elimination is temporary (like dirty tail or sneezing due to dust) and doesn't disqualify the rabbit permanently.",
      "DQs are for youth entries only.",
      "Eliminations are only for commercial weight limits."
    ],
    answer: "A DQ is for genetic or structural defects and stays on the rabbit's record; an Elimination is temporary (like dirty tail or sneezing due to dust) and doesn't disqualify the rabbit permanently.",
    explanation: "Disqualifications are major, often permanent faults (like structural deformities, blindness, or wrong eye color). Eliminations are for temporary issues (overweight, minor injury, dust allergies) or condition concerns."
  },
  {
    id: "q-sen-rules-2",
    level: "Senior",
    category: "Show Rules",
    type: "true-false",
    question: "Under ARBA rules, ear tattoos must be placed in the rabbit's right ear.",
    options: ["True", "False"],
    answer: "False",
    explanation: "Ear tattoos must be in the LEFT ear. The right ear is reserved for the official ARBA registration tattoo."
  },
  // Category: Care & Health
  {
    id: "q-sen-care-1",
    level: "Senior",
    category: "Care & Health",
    type: "multiple-choice",
    question: "What bacterial agent is the primary cause of 'Snuffles' and respiratory infections in rabbits?",
    options: ["Coccidia", "Pasteurella multocida", "Bordetella bronchiseptica", "Spirocheta"],
    answer: "Pasteurella multocida",
    explanation: "Pasteurella multocida is the main pathogen responsible for rabbit respiratory disease (snuffles), though Bordetella can also play a secondary role."
  },
  {
    id: "q-sen-care-2",
    level: "Senior",
    category: "Care & Health",
    type: "multiple-choice",
    question: "What digestive condition in rabbits is characterized by gut stasis, gas buildup, and lack of bowel movements?",
    options: ["Cecotropes bloating", "Enteritis / Gastrointestinal Stasis (GI Stasis)", "Coccidiosis", "Vent Disease"],
    answer: "Enteritis / Gastrointestinal Stasis (GI Stasis)",
    explanation: "GI Stasis is a life-threatening condition where the stomach/intestines slow down or stop completely, causing painful gas buildup and dehydration. Diet high in fiber is the best preventative."
  }
];
