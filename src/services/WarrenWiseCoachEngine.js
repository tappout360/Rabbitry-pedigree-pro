// WarrenWise AI Ultimate 4-H Coach Engine
// Provides 100% offline show rules, showmanship routines, breed standards, and adaptive 4-H coaching.

export const AGE_DIVISIONS = {
  cloverbud: {
    id: 'cloverbud',
    name: 'Cloverbud (Ages 5-8)',
    description: 'Fun, basic rabbit care, simple showmanship steps, and mascot encouragement.',
    readingLevel: 'beginner',
    tone: 'super-encouraging'
  },
  junior: {
    id: 'junior',
    name: 'Junior Division (Ages 9-11)',
    description: 'Showmanship routine, breed classes, feeding schedules, and basic ear tattoo checks.',
    readingLevel: 'intermediate',
    tone: 'supportive'
  },
  intermediate: {
    id: 'intermediate',
    name: 'Intermediate Division (Ages 12-14)',
    description: 'Body type classifications, disqualifications & faults, weight limits, and conditioning.',
    readingLevel: 'advanced-intermediate',
    tone: 'coaching'
  },
  senior: {
    id: 'senior',
    name: 'Senior Division (Ages 15-18)',
    description: 'Standard of Perfection deep dives, genetics (COI), registrar exam prep, and commercial yields.',
    readingLevel: 'expert',
    tone: 'professional-coach'
  }
};

export const ARBA_SHOWMANSHIP_ROUTINE = [
  {
    step: 1,
    title: 'Carrying & Transferring Your Rabbit',
    action: 'Support the hindquarters with one hand while tucked securely against your ribcage under your arm.',
    juniorTip: 'Tuck bunny like a football so they feel safe and do not get scared!',
    seniorTip: 'Always maintain firm support on hind legs to prevent kicking, spine injury, or struggling during table transfer.',
    checkPoints: ['Head tucked under arm', 'Hindquarters supported', 'Calm controlled movement']
  },
  {
    step: 2,
    title: 'Posing the Rabbit',
    action: 'Pose according to breed body type (Compact/Commercial feet underneath; Full Arch natural posture).',
    juniorTip: 'Front feet under eyes, back feet under hips!',
    seniorTip: 'Align front toes with eye centers. Ensure rear legs are parallel without hocks sticking out.',
    checkPoints: ['Front feet alignment', 'Rear feet placement', 'Ears alert and posed']
  },
  {
    step: 3,
    title: 'Checking Ears & Tattoo',
    action: 'Examine both ears for ear mites, sores, torn cartilage, and verify tattoo in left ear.',
    juniorTip: 'Read the tattoo out loud to the judge if asked!',
    seniorTip: 'Left ear must contain legible tattoo. Right ear is reserved for official ARBA registration tattoo.',
    checkPoints: ['Left ear tattoo legibility', 'Zero ear mites or crust', 'No ear tears']
  },
  {
    step: 4,
    title: 'Checking Eyes & Nose',
    action: 'Inspect eyes for wall eye, cataracts, or discharge. Check nose for nasal discharge (snuffles).',
    juniorTip: 'Clean eyes and dry nose mean a healthy bunny!',
    seniorTip: 'White nasal discharge indicates contagious snuffles (Pasteurella) and is an instant ARBA disqualification.',
    checkPoints: ['Clear pupils', 'No runny nose', 'No conjunctivitis (weeping eye)']
  },
  {
    step: 5,
    title: 'Checking Teeth & Malocclusion',
    action: 'Gently pull back lips to inspect incisors for wolf teeth, buck teeth, or broken teeth.',
    juniorTip: 'Top teeth should overlap bottom teeth slightly!',
    seniorTip: 'Malocclusion (simple or severe) or peg teeth abnormalities are permanent ARBA disqualifications.',
    checkPoints: ['Top incisors overlap bottom', 'No peg teeth defects', 'Clean gums']
  },
  {
    step: 6,
    title: 'Checking Front Legs & Toes',
    action: 'Press front legs gently to verify bone straightness. Count 5 toes on each front foot (including dewclaw).',
    juniorTip: '5 toes on each front paw!',
    seniorTip: 'Check for bowed legs, crooked bones, or missing toenails. White toenails on colored breeds = DQ.',
    checkPoints: ['5 toes on left & right front paws', 'Matching toenail color', 'Straight bones']
  },
  {
    step: 7,
    title: 'Checking Rear Legs & Hocks',
    action: 'Extend hind legs. Count 4 toes on each rear foot. Inspect heel hocks for sore hocks.',
    juniorTip: '4 toes on each back paw!',
    seniorTip: 'Examine hock pads for raw bleeding sore hocks. Ensure rear legs push straight without splay.',
    checkPoints: ['4 toes on left & right rear paws', 'No sore hocks', 'No splayed leg defect']
  },
  {
    step: 8,
    title: 'Checking Sex & Reproductive Health',
    action: 'Gently press finger and thumb near vent area to reveal buck (penis) or doe (vulva).',
    juniorTip: 'Bucks have a round circle organ, does have a slit!',
    seniorTip: 'Inspect for vent disease (spirochetosis), purulent inflammation, or missing testicles on senior bucks.',
    checkPoints: ['Correct sex verification', 'Zero vent disease signs', 'Senior buck testicle check']
  },
  {
    step: 9,
    title: 'Checking Belly & Abdomen',
    action: 'Run hand along belly to check for abscesses, tumors, mastitis, or umbilical hernia.',
    juniorTip: 'Belly should feel smooth and soft!',
    seniorTip: 'Check doe teats for caked udder or mastitis. Feel abdomen for internal abscesses or ruptures.',
    checkPoints: ['Smooth belly', 'No herniation', 'No abscesses']
  },
  {
    step: 10,
    title: 'Checking Tail & Spine',
    action: 'Run fingers down spine to tail. Flip tail gently to check for screw tail, bob tail, or broken tail.',
    juniorTip: 'Tail should point straight up and back!',
    seniorTip: 'Wry tail (permanently turned), screw tail, or missing tail segments are ARBA disqualifications.',
    checkPoints: ['Straight tail', 'No wry tail kink', 'Flexible spine']
  },
  {
    step: 11,
    title: 'Checking Fur Type & Condition',
    action: 'Stroke fur backward to test density, texture, and return (Flyback, Rollback, Rex, or Wool).',
    juniorTip: 'Smooth the fur back down nicely!',
    seniorTip: 'Evaluate moult condition, guard hair density, undercoat thickness, and guard hair stiffness.',
    checkPoints: ['Proper fur type for breed', 'Clean coat free of stain', 'Good density & condition']
  },
  {
    step: 12,
    title: 'Final Pose & Courtesy to Judge',
    action: 'Return rabbit to proper posed position. Step back slightly and make eye contact with judge.',
    juniorTip: 'Smile and thank the judge!',
    seniorTip: 'Be prepared to answer judge questions regarding breed weight limits, origin, or variety standards.',
    checkPoints: ['Immaculate final pose', 'Attentive posture', 'Polite judge responses']
  }
];

export const ARBA_BREED_BODY_TYPES = {
  compact: {
    name: 'Compact Body Type',
    description: 'Lighter weight, short arch rising over shoulders to rounded hips.',
    examples: ['Holland Lop', 'Mini Rex', 'Netherland Dwarf', 'Dutch', 'Mini Satin', 'Polish'],
    classType: '4-Class Breed'
  },
  commercial: {
    name: 'Commercial Body Type',
    description: 'Ideal meat yield depth and width. High arch starting behind ears peaking over hips.',
    examples: ['New Zealand', 'Californian', 'Rex', 'Palomino', 'Satin', 'French Lop'],
    classType: '6-Class Breed'
  },
  full_arch: {
    name: 'Full Arch Body Type',
    description: 'Continuous arch from neck through tail. Alert erect posture off table.',
    examples: ['Belgian Hare', 'Checkered Giant', 'English Spot', 'Tan', 'Rhinelander'],
    classType: '4-Class or 6-Class'
  },
  semi_arch: {
    name: 'Semi-Arch (Mandolin) Body Type',
    description: 'Low head carriage with long arch starting behind shoulders.',
    examples: ['Flemish Giant', 'Beveren', 'American', 'English Lop', 'Giant Chinchilla'],
    classType: '6-Class Breed'
  },
  cylindrical: {
    name: 'Cylindrical Body Type',
    description: 'Long narrow round tube shape.',
    examples: ['Himalayan'],
    classType: '4-Class Breed'
  }
};

export function getWarrenWiseCoachAdvice(query, division = 'junior') {
  const q = query.toLowerCase();
  const divInfo = AGE_DIVISIONS[division] || AGE_DIVISIONS.junior;

  if (q.includes('showmanship') || q.includes('step') || q.includes('routine') || q.includes('pose')) {
    return {
      topic: 'Showmanship Routine',
      summary: `Here is your step-by-step showmanship guide tailored for ${divInfo.name}!`,
      steps: ARBA_SHOWMANSHIP_ROUTINE,
      disclaimer: 'For official showmanship scoring sheets, consult your local 4-H extension agent or licensed registrar.'
    };
  }

  if (q.includes('body type') || q.includes('commercial') || q.includes('compact') || q.includes('breed')) {
    return {
      topic: 'Body Type Classifications',
      summary: 'There are 5 distinct rabbit body types recognized in show standards:',
      types: ARBA_BREED_BODY_TYPES,
      disclaimer: 'Always verify breed weight minimums and maximums in the official Standard of Perfection.'
    };
  }

  // Default encouraging general advice response
  return {
    topic: 'General 4-H Rabbit & Cavy Coaching',
    summary: `Hello 4-H Exhibitor! WarrenWise Coach is here to help you excel in your 4-H rabbitry project.`,
    tips: [
      'Daily feeding at the same time creates calm, manageable show rabbits.',
      'Check water bottles every morning to ensure nozzles do not freeze or clog.',
      'Practice your 12-step showmanship routine at least twice a week before fair.',
      'Keep your 4-H project record book updated after every feed purchase or sale.'
    ],
    disclaimer: 'WarrenWise Coach is an educational tool. For official rules, consult the Standard of Perfection from your local registry.'
  };
}
